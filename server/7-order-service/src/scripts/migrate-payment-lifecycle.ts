import { config } from '@order/config';
import { OrderModel } from '@order/models/order.schema';
import mongoose from 'mongoose';

const apply = process.argv.includes('--apply');

const run = async (): Promise<void> => {
  await mongoose.connect(`${config.DATABASE_URL}`);
  const orders = await OrderModel.collection.find({}).toArray();
  let changed = 0;
  let sepayOrders = 0;
  let sepayPendingExpired = 0;

  for (const order of orders) {
    const normalizedStatus = `${order.status || ''}`.toLowerCase().replace(/_/g, ' ');
    const provider = `${order.paymentProvider || 'sepay'}`.toLowerCase();
    const set: Record<string, unknown> = {};
    let paymentStatus = `${order.paymentStatus || ''}`;

    if (!paymentStatus) {
      if (order.approved || normalizedStatus === 'completed') paymentStatus = 'RELEASED';
      else if (['in progress', 'delivered', 'disputed'].includes(normalizedStatus)) paymentStatus = 'HELD';
      else paymentStatus = 'PENDING';
      set.paymentStatus = paymentStatus;
    }
    if (!order.dueAt && order.offer?.newDeliveryDate) set.dueAt = order.offer.newDeliveryDate;
    if (!order.paidAt && ['HELD', 'RELEASED'].includes(paymentStatus)) set.paidAt = order.dateOrdered || new Date();
    if (!order.releasedAt && paymentStatus === 'RELEASED') set.releasedAt = order.approvedAt || new Date();

    if (provider === 'sepay') {
      sepayOrders += 1;
      if (paymentStatus === 'PENDING' || normalizedStatus === 'pending payment') {
        set.paymentStatus = 'PAYMENT_EXPIRED';
        set.status = 'PAYMENT_EXPIRED';
        sepayPendingExpired += 1;
      }
    }

    if (Object.keys(set).length) {
      changed += 1;
      if (apply) await OrderModel.collection.updateOne({ _id: order._id }, { $set: set });
    }
  }

  console.log(JSON.stringify({
    mode: apply ? 'apply' : 'dry-run', scanned: orders.length, changed, sepayOrders, sepayPendingExpired
  }, null, 2));
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
