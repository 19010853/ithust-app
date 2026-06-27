import { FC, ReactElement, useState } from 'react';
import Button from 'src/shared/button/Button';
import { formatVnd, formatVndNumber, parseVndInput } from 'src/shared/utils/currency.utils';
import { showErrorToast, showSuccessToast } from 'src/shared/utils/utils.service';
import { useCreateRefundWithdrawalMutation, useGetCurrentBuyerByUsernameQuery } from '../services/buyer.service';
import { IBuyerDocument } from '../interfaces/buyer.interface';

const RefundBalance: FC = (): ReactElement => {
  const { data } = useGetCurrentBuyerByUsernameQuery();
  const buyer = (data?.buyer || {}) as IBuyerDocument;
  const available = Number(buyer.refundAvailableBalance || 0);
  const pending = Number(buyer.refundPendingWithdrawals || 0);
  const [amount, setAmount] = useState('');
  const [paypalEmail, setPaypalEmail] = useState(buyer.email || '');
  const [withdraw, { isLoading }] = useCreateRefundWithdrawalMutation();

  const submit = async (): Promise<void> => {
    const parsed = Number(parseVndInput(amount));
    if (!buyer._id || !Number.isInteger(parsed) || parsed <= 0 || parsed > available || !/^\S+@\S+\.\S+$/.test(paypalEmail)) {
      showErrorToast('Kiểm tra số tiền và email PayPal.');
      return;
    }
    try {
      await withdraw({ buyerId: buyer._id, amount: parsed, paypalEmail }).unwrap();
      setAmount('');
      showSuccessToast('Yêu cầu payout refund đã được gửi tới PayPal.');
    } catch {
      showErrorToast('Không thể gửi payout refund.');
    }
  };

  return (
    <div className="mb-6 rounded border border-gray-200 bg-white p-4">
      <h2 className="mb-3 text-lg font-bold">Số dư hoàn tiền</h2>
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded bg-gray-50 p-3">Khả dụng: <strong>{formatVnd(available)}</strong></div>
        <div className="rounded bg-gray-50 p-3">Đang payout: <strong>{formatVnd(pending)}</strong></div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <input
          className="rounded border px-3 py-2"
          type="text"
          inputMode="numeric"
          value={amount ? formatVndNumber(amount) : ''}
          onChange={(e) => setAmount(parseVndInput(e.target.value))}
          placeholder="Số tiền VND"
        />
        <input className="rounded border px-3 py-2" type="email" value={paypalEmail} onChange={(e) => setPaypalEmail(e.target.value)} placeholder="Email PayPal" />
        <Button
          className="rounded bg-sky-500 px-4 py-2 font-bold text-white disabled:bg-gray-400"
          label={isLoading ? 'Đang gửi...' : 'Rút tiền hoàn qua PayPal'}
          disabled={isLoading || available <= 0}
          onClick={submit}
        />
      </div>
      <p className="mt-2 text-xs text-gray-500">Sandbox xử lý tự động; production chỉ bật khi tài khoản PayPal được cấp Payouts.</p>
    </div>
  );
};

export default RefundBalance;
