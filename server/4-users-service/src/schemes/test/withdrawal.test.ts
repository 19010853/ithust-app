import { withdrawalSchema } from '@users/schemes/withdrawal';

describe('Withdrawal schema', () => {
  it('accepts a positive amount-only withdrawal and strips bank account details', () => {
    const { error, value } = withdrawalSchema.validate({
      amount: 100000,
      bankAccount: {
        bankName: ' VCB ',
        accountNumber: ' 3123231313123131 ',
        accountName: ' NGUYEN MANH TUONG '
      }
    });

    expect(error).toBeUndefined();
    expect(value).toEqual({
      amount: 100000
    });
  });

  it('rejects a withdrawal without a valid amount', () => {
    const { error } = withdrawalSchema.validate({
      amount: 0
    });

    expect(error?.details[0].message).toBe('Withdrawal amount must be greater than zero');
  });

  it('rejects decimal withdrawal amounts', () => {
    const { error } = withdrawalSchema.validate({
      amount: 100000.5
    });

    expect(error?.details[0].message).toBe('Withdrawal amount must be a whole VND amount');
  });
});
