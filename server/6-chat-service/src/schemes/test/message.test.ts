import { messageSchema } from '@chat/schemes/message';

const validMessage = {
  conversationId: 'conversation-id',
  body: 'Custom offer',
  sellerId: 'seller-id',
  buyerId: 'buyer-id',
  senderUsername: 'seller',
  senderPicture: 'https://placehold.co/80x80',
  receiverUsername: 'buyer',
  receiverPicture: 'https://placehold.co/80x80',
  hasOffer: true,
  offer: {
    gigTitle: 'Build an app',
    price: 100000,
    description: 'Custom app build',
    deliveryInDays: 3,
    oldDeliveryDate: new Date().toISOString(),
    newDeliveryDate: new Date().toISOString(),
    accepted: false,
    cancelled: false
  }
};

describe('Message schema offer VND validation', () => {
  it('accepts integer VND offer prices within range', () => {
    expect(messageSchema.validate(validMessage).error).toBeUndefined();
  });

  it('rejects offer prices below the VND minimum', () => {
    const { error } = messageSchema.validate({ ...validMessage, offer: { ...validMessage.offer, price: 99999 } });

    expect(error?.details[0].message).toBe('Offer price must be at least 100000 VND');
  });

  it('rejects offer prices above the VND maximum', () => {
    const { error } = messageSchema.validate({ ...validMessage, offer: { ...validMessage.offer, price: 250000001 } });

    expect(error?.details[0].message).toBe('Offer price must be at most 250000000 VND');
  });

  it('rejects decimal offer prices', () => {
    const { error } = messageSchema.validate({ ...validMessage, offer: { ...validMessage.offer, price: 100000.5 } });

    expect(error?.details[0].message).toBe('Offer price must be a whole VND amount');
  });
});
