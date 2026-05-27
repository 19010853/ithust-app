import { withdrawalSchema } from '@users/schemes/withdrawal';

describe('Withdrawal schema', () => {
  it('accepts a positive withdrawal with complete bank account details', () => {
    const { error, value } = withdrawalSchema.validate({
      amount: 2.2,
      bankAccount: {
        bankName: ' VCB ',
        accountNumber: ' 3123231313123131 ',
        accountName: ' NGUYEN MANH TUONG '
      }
    });

    expect(error).toBeUndefined();
    expect(value).toEqual({
      amount: 2.2,
      bankAccount: {
        bankName: 'VCB',
        accountNumber: '3123231313123131',
        accountName: 'NGUYEN MANH TUONG'
      }
    });
  });

  it('rejects a withdrawal without valid amount and bank account fields', () => {
    const { error } = withdrawalSchema.validate({
      amount: 0,
      bankAccount: {
        bankName: '',
        accountNumber: 'abc',
        accountName: ''
      }
    });

    expect(error?.details[0].message).toBe('Withdrawal amount must be greater than zero');
  });
});
