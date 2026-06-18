import { gigCreateSchema, gigUpdateSchema } from '@gig/schemes/gig';

const validGigUpdate = {
  title: 'I will build a TypeScript app',
  description: 'A complete app',
  categories: 'Programming & Tech',
  subCategories: ['Web Development'],
  tags: ['typescript'],
  price: 100000,
  coverImage: 'https://placehold.co/330x220',
  expectedDelivery: '3 Days Delivery',
  basicTitle: 'Basic package',
  basicDescription: 'Basic package description'
};

const validGig = {
  sellerId: 'seller-id',
  profilePicture: 'https://placehold.co/80x80',
  ...validGigUpdate
};

describe('Gig schema VND validation', () => {
  it('accepts integer VND prices within range', () => {
    expect(gigCreateSchema.validate(validGig).error).toBeUndefined();
    expect(gigUpdateSchema.validate(validGigUpdate).error).toBeUndefined();
  });

  it('rejects prices below the VND minimum', () => {
    const { error } = gigCreateSchema.validate({ ...validGig, price: 99999 });

    expect(error?.details[0].message).toBe('Gig price must be at least 100000 VND');
  });

  it('rejects prices above the VND maximum', () => {
    const { error } = gigCreateSchema.validate({ ...validGig, price: 250000001 });

    expect(error?.details[0].message).toBe('Gig price must be at most 250000000 VND');
  });

  it('rejects decimal prices', () => {
    const { error } = gigCreateSchema.validate({ ...validGig, price: 100000.5 });

    expect(error?.details[0].message).toBe('Gig price must be a whole VND amount');
  });
});
