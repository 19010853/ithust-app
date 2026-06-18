import { Client } from '@elastic/elasticsearch';
import dotenv from 'dotenv';
import mongoose, { Connection, Types } from 'mongoose';

dotenv.config({});

const MIGRATION_RATE = 25000;

type DbName = 'order' | 'gig' | 'chat' | 'users';

interface MigrationOptions {
  apply: boolean;
  dbUrls: Record<DbName, string>;
  elasticUrl: string;
}

interface MigrationSummary {
  name: string;
  scanned: number;
  changed: number;
}

type MongoDocument = {
  _id: Types.ObjectId | string;
  [key: string]: unknown;
};

const parseArgs = (): MigrationOptions => {
  const args = process.argv.slice(2);
  const optionValue = (name: string): string => args.find((item) => item.startsWith(`${name}=`))?.split('=').slice(1).join('=') || '';

  return {
    apply: args.includes('--apply'),
    dbUrls: {
      order: optionValue('--order-db') || process.env.ORDER_DATABASE_URL || process.env.DATABASE_URL || '',
      gig: optionValue('--gig-db') || process.env.GIG_DATABASE_URL || '',
      chat: optionValue('--chat-db') || process.env.CHAT_DATABASE_URL || '',
      users: optionValue('--users-db') || process.env.USERS_DATABASE_URL || ''
    },
    elasticUrl: optionValue('--elastic-url') || process.env.ELASTIC_SEARCH_URL || ''
  };
};

const toVnd = (value: number, rate: number): number => Math.round(value * rate);

const getPath = (document: MongoDocument, path: string): unknown =>
  path.split('.').reduce<unknown>((current, key) => {
    if (!current || typeof current !== 'object') {
      return undefined;
    }
    return (current as Record<string, unknown>)[key];
  }, document);

const connect = async (name: DbName, url: string): Promise<Connection | undefined> => {
  if (!url) {
    console.log(`[skip] ${name}: no database URL provided.`);
    return undefined;
  }

  const connection = await mongoose.createConnection(url).asPromise();
  console.log(`[connect] ${name}: ${connection.name}`);
  return connection;
};

const migrateFields = async (
  name: string,
  connection: Connection,
  collectionName: string,
  fields: string[],
  options: MigrationOptions,
  onChanged?: (document: MongoDocument, set: Record<string, number | string>) => Promise<void>
): Promise<MigrationSummary> => {
  const collection = connection.collection<MongoDocument>(collectionName);
  let scanned = 0;
  let changed = 0;

  for await (const document of collection.find({}) as AsyncIterable<MongoDocument>) {
    scanned += 1;
    const set: Record<string, number | string> = {};

    for (const field of fields) {
      const value = getPath(document, field);
      if (typeof value === 'number' && Number.isFinite(value)) {
        const nextValue = toVnd(value, MIGRATION_RATE);
        if (nextValue !== value) {
          set[field] = nextValue;
        }
      }
    }

    if (collectionName === 'Order' && getPath(document, 'paymentCurrency') !== 'VND') {
      set.paymentCurrency = 'VND';
    }

    if (Object.keys(set).length) {
      changed += 1;
      console.log(`[${options.apply ? 'apply' : 'dry-run'}] ${name} ${String(document._id)} -> ${JSON.stringify(set)}`);
      if (options.apply) {
        await collection.updateOne({ _id: document._id }, { $set: set });
        if (onChanged) {
          await onChanged(document, set);
        }
      }
    }
  }

  return { name, scanned, changed };
};

const updateGigIndex = async (elasticClient: Client | undefined, document: MongoDocument, set: Record<string, number | string>): Promise<void> => {
  if (!elasticClient || typeof set.price !== 'number') {
    return;
  }

  await elasticClient.update({
    index: 'gigs',
    id: String(document._id),
    doc: { price: set.price }
  });
};

const main = async (): Promise<void> => {
  const options = parseArgs();
  const connections: Connection[] = [];
  const summaries: MigrationSummary[] = [];
  const elasticClient = options.apply && options.elasticUrl ? new Client({ node: options.elasticUrl }) : undefined;

  console.log(`USD to VND migration running in ${options.apply ? 'apply' : 'dry-run'} mode with rate ${MIGRATION_RATE}.`);
  console.log('Pass --apply to persist changes.');

  try {
    const orderConnection = await connect('order', options.dbUrls.order);
    const gigConnection = await connect('gig', options.dbUrls.gig);
    const chatConnection = await connect('chat', options.dbUrls.chat);
    const usersConnection = await connect('users', options.dbUrls.users);

    for (const connection of [orderConnection, gigConnection, chatConnection, usersConnection]) {
      if (connection) {
        connections.push(connection);
      }
    }

    if (gigConnection) {
      summaries.push(
        await migrateFields('Gig.price', gigConnection, 'Gig', ['price'], options, (document, set) =>
          updateGigIndex(elasticClient, document, set)
        )
      );
    }

    if (chatConnection) {
      summaries.push(await migrateFields('Message.offer.price', chatConnection, 'Message', ['offer.price'], options));
    }

    if (orderConnection) {
      summaries.push(await migrateFields('Order money fields', orderConnection, 'Order', ['offer.price', 'price', 'serviceFee'], options));
    }

    if (usersConnection) {
      summaries.push(
        await migrateFields('Seller balances', usersConnection, 'Seller', ['totalEarnings', 'availableBalance', 'pendingWithdrawals'], options)
      );
      summaries.push(await migrateFields('Withdrawal.amount', usersConnection, 'Withdrawal', ['amount'], options));
      summaries.push(await migrateFields('AdminAudit.availableBalance', usersConnection, 'AdminAudit', ['availableBalance'], options));
    }

    console.log('Migration summary:');
    for (const summary of summaries) {
      console.log(`- ${summary.name}: scanned ${summary.scanned}, changed ${summary.changed}`);
    }

    if (options.apply && !options.elasticUrl) {
      console.log('[warn] No Elasticsearch URL provided; migrated Mongo gig prices but did not update the gigs index.');
    }
  } finally {
    await Promise.all(connections.map((connection) => connection.close()));
    await mongoose.disconnect();
  }
};

main().catch((error: Error) => {
  console.error(error);
  process.exitCode = 1;
});
