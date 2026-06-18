import { orderSchema } from '@order/schemes/order';

const validOrder = {
  offer: {
    gigTitle: 'Build an app',
    price: 500000,
    description: 'Custom app build',
    deliveryInDays: 3,
    oldDeliveryDate: new Date().toISOString(),
    newDeliveryDate: new Date().toISOString(),
    accepted: false,
    cancelled: false
  },
  gigId: 'gig-id',
  sellerId: 'seller-id',
  sellerUsername: 'seller',
  sellerEmail: 'seller@example.com',
  sellerImage: 'https://placehold.co/80x80',
  gigCoverImage: 'https://placehold.co/330x220',
  gigMainTitle: 'Main gig',
  gigBasicTitle: 'Basic gig',
  gigBasicDescription: 'Basic description',
  buyerId: 'buyer-id',
  buyerUsername: 'buyer',
  buyerEmail: 'buyer@example.com',
  buyerImage: 'https://placehold.co/80x80',
  status: 'pending',
  orderId: 'JO123',
  invoiceId: 'JI123',
  quantity: 1,
  price: 500000,
  serviceFee: 77500
};

describe('Order schema VND validation', () => {
  it('accepts integer VND order prices and service fees', () => {
    expect(orderSchema.validate(validOrder).error).toBeUndefined();
  });

  it('rejects decimal order prices', () => {
    const { error } = orderSchema.validate({ ...validOrder, price: 500000.5 });

    expect(error?.details[0].message).toBe('Order price must be a whole VND amount');
  });

  it('rejects decimal offer prices', () => {
    const { error } = orderSchema.validate({ ...validOrder, offer: { ...validOrder.offer, price: 500000.5 } });

    expect(error?.details[0].message).toBe('Order price must be a whole VND amount');
  });

  it('rejects decimal service fees', () => {
    const { error } = orderSchema.validate({ ...validOrder, serviceFee: 77500.5 });

    expect(error?.details[0].message).toBe('Service fee must be a whole VND amount');
  });
});
