/**
 * seed-benchmark.mjs
 * Sinh 5000+ gigs tổng hợp vào MongoDB + Elasticsearch để phục vụ benchmark.
 *
 * Cách chạy (từ thư mục 5-gig-service):
 *   node scripts/seed-benchmark.mjs [--count 5000] [--clear]
 *
 * Flags:
 *   --count N   Số lượng gigs cần sinh (mặc định: 5000)
 *   --clear     Xoá toàn bộ dữ liệu benchmark cũ trước khi seed (tag: benchmark=true)
 */

import mongoose from 'mongoose';
import { Client as ESClient } from '@elastic/elasticsearch';
import { faker } from '@faker-js/faker';

const MONGO_URI = process.env.DATABASE_URL || 'mongodb://127.0.0.1:27017/ithust-gig';
const ES_URL    = process.env.ELASTIC_SEARCH_URL || 'http://elastic:admin1234@localhost:9200';
const ES_INDEX  = 'gigs';
const BATCH_SIZE = 200;

const args = process.argv.slice(2);
const COUNT = parseInt(args[args.indexOf('--count') + 1]) || 5000;
const CLEAR = args.includes('--clear');

// Phân phối từ khóa theo category — đảm bảo mỗi query trong k6 trả về kết quả không rỗng
const CATEGORY_DATA = {
  'Programming & Tech': {
    subCategories: ['Web Development', 'Mobile Apps', 'Desktop Apps', 'Scripts & Automation', 'Database'],
    keywords: ['programming', 'nodejs', 'react', 'python', 'api', 'backend', 'frontend', 'fullstack', 'typescript', 'javascript'],
    titleTemplates: [
      'I will build a {kw} application for you',
      'Professional {kw} development service',
      'Custom {kw} solution for your business',
      'I will create a {kw} website from scratch',
      'Expert {kw} developer for hire'
    ]
  },
  'Graphics & Design': {
    subCategories: ['Logo Design', 'Brand Identity', 'UI/UX Design', 'Illustration', 'Flyer Design'],
    keywords: ['logo', 'design', 'branding', 'illustration', 'ui', 'ux', 'graphic', 'photoshop', 'figma', 'vector'],
    titleTemplates: [
      'I will design a professional {kw} for you',
      'Creative {kw} design service',
      'Modern {kw} design for your brand',
      'I will create a stunning {kw}',
      'Unique {kw} design that stands out'
    ]
  },
  'Digital Marketing': {
    subCategories: ['Social Media', 'SEO', 'Content Marketing', 'Email Marketing', 'PPC'],
    keywords: ['marketing', 'seo', 'social media', 'content', 'ads', 'growth', 'campaign', 'analytics', 'traffic', 'conversion'],
    titleTemplates: [
      'I will create a {kw} strategy for your business',
      'Professional {kw} services',
      'I will boost your {kw} performance',
      'Expert {kw} consultant',
      'I will manage your {kw} campaigns'
    ]
  },
  'Writing & Translation': {
    subCategories: ['Blog Posts', 'Copywriting', 'Translation', 'Proofreading', 'Technical Writing'],
    keywords: ['writing', 'content', 'copywriting', 'blog', 'article', 'translation', 'proofreading', 'editing', 'seo writing', 'creative'],
    titleTemplates: [
      'I will write professional {kw} for your website',
      'Expert {kw} services',
      'I will create engaging {kw} content',
      'High-quality {kw} writing service',
      'I will proofread and edit your {kw}'
    ]
  },
  'Video & Animation': {
    subCategories: ['Video Editing', 'Animation', 'Motion Graphics', 'Whiteboard', 'Explainer Videos'],
    keywords: ['video', 'animation', 'editing', 'motion graphics', 'explainer', 'whiteboard', 'youtube', 'promo', 'intro', 'after effects'],
    titleTemplates: [
      'I will create a {kw} for your business',
      'Professional {kw} production',
      'I will produce high-quality {kw}',
      'Expert {kw} editor for hire',
      'I will design an animated {kw}'
    ]
  },
  'Music & Audio': {
    subCategories: ['Voice Over', 'Music Production', 'Sound Effects', 'Mixing & Mastering', 'Podcast'],
    keywords: ['music', 'audio', 'voice over', 'podcast', 'mixing', 'mastering', 'beat', 'jingle', 'sound', 'recording'],
    titleTemplates: [
      'I will record a professional {kw} for you',
      'Studio-quality {kw} production',
      'I will create a custom {kw}',
      'Professional {kw} services',
      'I will mix and master your {kw}'
    ]
  },
  'Data': {
    subCategories: ['Data Analysis', 'Data Visualization', 'Machine Learning', 'Web Scraping', 'Database'],
    keywords: ['data', 'analysis', 'machine learning', 'ai', 'visualization', 'excel', 'python', 'scraping', 'dashboard', 'statistics'],
    titleTemplates: [
      'I will analyze your {kw} and provide insights',
      'Professional {kw} analysis services',
      'I will build a {kw} model for you',
      'Expert {kw} consultant',
      'I will create a {kw} visualization dashboard'
    ]
  },
  'Business': {
    subCategories: ['Virtual Assistant', 'Business Plans', 'Market Research', 'Legal Consulting', 'HR'],
    keywords: ['business', 'consulting', 'strategy', 'research', 'plan', 'management', 'startup', 'excel', 'powerpoint', 'presentation'],
    titleTemplates: [
      'I will create a professional {kw} for your company',
      'Expert {kw} consulting services',
      'I will help you with {kw} strategy',
      'Professional {kw} writer',
      'I will develop your {kw} from scratch'
    ]
  }
};

const CATEGORIES = Object.keys(CATEGORY_DATA);
const DELIVERY_TIMES = ['1 Day Delivery', '2 Days Delivery', '3 Days Delivery', '5 Days Delivery', '7 Days Delivery'];

// Mongoose Schema
const gigSchema = new mongoose.Schema(
  {
    sellerId:         { type: mongoose.Schema.Types.ObjectId },
    username:         { type: String },
    profilePicture:   { type: String },
    email:            { type: String },
    title:            { type: String },
    description:      { type: String },
    basicTitle:       { type: String },
    basicDescription: { type: String },
    categories:       { type: String },
    subCategories:    [String],
    tags:             [String],
    active:           { type: Boolean, default: true },
    expectedDelivery: { type: String },
    ratingsCount:     { type: Number, default: 0 },
    ratingSum:        { type: Number, default: 0 },
    ratingCategories: mongoose.Schema.Types.Mixed,
    price:            { type: Number },
    sortId:           { type: Number },
    coverImage:       { type: String },
    createdAt:        { type: Date, default: Date.now },
    _benchmark:       { type: Boolean, default: true }
  },
  { versionKey: false }
);

const GigModel = mongoose.model('Gig', gigSchema, 'Gig');

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateGig(index, startSortId) {
  const category = pickRandom(CATEGORIES);
  const catData = CATEGORY_DATA[category];
  const keyword = pickRandom(catData.keywords);
  const titleTemplate = pickRandom(catData.titleTemplates);
  const title = titleTemplate.replace('{kw}', keyword);

  const numSubCats = faker.number.int({ min: 1, max: 3 });
  const subCategories = faker.helpers
    .shuffle([...catData.subCategories])
    .slice(0, numSubCats);

  const numTags = faker.number.int({ min: 2, max: 5 });
  const tags = [keyword, ...faker.helpers.shuffle([...catData.keywords]).slice(0, numTags - 1)];

  const ratingSum = faker.number.int({ min: 0, max: 50 });
  const ratingsCount = ratingSum > 0 ? faker.number.int({ min: 1, max: Math.ceil(ratingSum / 3) }) : 0;

  return {
    sellerId: new mongoose.Types.ObjectId(),
    username: faker.internet.userName().toLowerCase(),
    profilePicture: `https://placehold.co/200x200?text=${faker.string.alpha(2).toUpperCase()}`,
    email: faker.internet.email().toLowerCase(),
    title,
    description: `${title}. ${faker.lorem.sentences(3)} ${keyword} ${faker.lorem.sentences(2)}`,
    basicTitle: `Basic ${title}`,
    basicDescription: `${faker.lorem.sentence()} ${keyword} ${faker.lorem.sentence()}`,
    categories: category,
    subCategories,
    tags,
    active: true,
    expectedDelivery: pickRandom(DELIVERY_TIMES),
    ratingsCount,
    ratingSum,
    ratingCategories: {
      five:  { value: 5, count: 0 },
      four:  { value: 4, count: 0 },
      three: { value: 3, count: 0 },
      two:   { value: 2, count: 0 },
      one:   { value: 1, count: 0 }
    },
    price: faker.number.int({ min: 100000, max: 5000000 }),
    sortId: startSortId + index,
    coverImage: `https://placehold.co/400x300?text=Gig+${startSortId + index}`,
    createdAt: faker.date.past({ years: 2 }),
    _benchmark: true
  };
}

async function main() {
  console.log(`\n🚀  Benchmark Seeder — sinh ${COUNT} gigs\n`);

  // Kết nối
  await mongoose.connect(MONGO_URI);
  console.log('✅  MongoDB connected');

  const esClient = new ESClient({ node: ES_URL });
  await esClient.ping();
  console.log('✅  Elasticsearch connected');

  // Xoá dữ liệu benchmark cũ nếu có --clear
  if (CLEAR) {
    console.log('\n🗑️  Xoá dữ liệu benchmark cũ...');
    const deleted = await GigModel.deleteMany({ _benchmark: true });
    console.log(`   MongoDB: xoá ${deleted.deletedCount} docs`);
    await esClient.deleteByQuery({
      index: ES_INDEX,
      query: { term: { _benchmark: true } },
      refresh: true
    }).catch(() => console.log('   ES: không có doc nào để xoá'));
  }

  // Lấy sortId hiện tại để không trùng
  const lastGig = await GigModel.findOne().sort({ sortId: -1 }).select('sortId').lean();
  const startSortId = (lastGig?.sortId ?? 0) + 1;
  console.log(`\n📊  startSortId = ${startSortId}`);
  console.log(`📊  Sinh ${COUNT} gigs theo ${BATCH_SIZE}/batch\n`);

  const totalStart = Date.now();
  let mongoInserted = 0;
  let esIndexed = 0;
  const batches = Math.ceil(COUNT / BATCH_SIZE);

  for (let b = 0; b < batches; b++) {
    const batchStart = b * BATCH_SIZE;
    const batchEnd = Math.min(batchStart + BATCH_SIZE, COUNT);
    const batchSize = batchEnd - batchStart;

    const docs = Array.from({ length: batchSize }, (_, i) =>
      generateGig(batchStart + i, startSortId)
    );

    // MongoDB batch insert
    const inserted = await GigModel.insertMany(docs, { ordered: false });
    mongoInserted += inserted.length;

    // ES bulk index
    const bulkOps = inserted.flatMap((doc) => [
      { index: { _index: ES_INDEX, _id: doc._id.toString() } },
      {
        sellerId: doc.sellerId.toString(),
        username: doc.username,
        profilePicture: doc.profilePicture,
        email: doc.email,
        title: doc.title,
        description: doc.description,
        basicTitle: doc.basicTitle,
        basicDescription: doc.basicDescription,
        categories: doc.categories,
        subCategories: doc.subCategories,
        tags: doc.tags,
        active: doc.active,
        expectedDelivery: doc.expectedDelivery,
        ratingsCount: doc.ratingsCount,
        ratingSum: doc.ratingSum,
        ratingCategories: doc.ratingCategories,
        price: doc.price,
        sortId: doc.sortId,
        coverImage: doc.coverImage,
        createdAt: doc.createdAt,
        _benchmark: true
      }
    ]);

    const bulkResult = await esClient.bulk({ operations: bulkOps, refresh: false });
    esIndexed += bulkResult.items.filter((item) => !item.index?.error).length;

    const pct = Math.round((batchEnd / COUNT) * 100);
    process.stdout.write(`\r   [${pct}%] Batch ${b + 1}/${batches} — MongoDB: ${mongoInserted}, ES: ${esIndexed}`);
  }

  // Refresh ES index để searchable ngay
  await esClient.indices.refresh({ index: ES_INDEX });

  const elapsed = ((Date.now() - totalStart) / 1000).toFixed(1);
  console.log(`\n\n${'─'.repeat(55)}`);
  console.log(`✅  Seeding hoàn tất trong ${elapsed}s`);
  console.log(`   MongoDB       : ${mongoInserted}/${COUNT} gigs`);
  console.log(`   Elasticsearch : ${esIndexed}/${COUNT} gigs`);
  console.log(`   startSortId   : ${startSortId}`);
  console.log(`   endSortId     : ${startSortId + COUNT - 1}`);
  console.log(`${'─'.repeat(55)}\n`);

  await mongoose.disconnect();
  console.log('🎉  Xong! Chạy benchmark:\n   bash benchmark/run-benchmark.sh\n');
}

main().catch((err) => {
  console.error('\n❌  Lỗi:', err);
  process.exit(1);
});
