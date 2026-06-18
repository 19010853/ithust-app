import { filter, sumBy } from 'lodash';
import { FC, ReactElement, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { IOrderDocument } from 'src/features/order/interfaces/order.interface';
import Button from 'src/shared/button/Button';
import { formatVnd, toVndInteger } from 'src/shared/utils/currency.utils';
import { isFetchBaseQueryError, normalizeOrderStatus, shortenLargeNumbers, showErrorToast, showSuccessToast } from 'src/shared/utils/utils.service';

import { SellerContextType } from '../../interfaces/seller.interface';
import { useCreateWithdrawalMutation } from '../../services/seller.service';
import ManageEarningsTable from './components/ManageEarningsTable';

const ManageEarnings: FC = (): ReactElement => {
  const { orders, seller } = useOutletContext<SellerContextType>();
  const completedOrders: IOrderDocument[] = filter(orders, (order: IOrderDocument) => normalizeOrderStatus(order.status) === 'delivered');
  const sum: number = sumBy(orders, 'price');
  const average: number = sum / orders.length;
  const averageSellingPrice = average ? parseInt(shortenLargeNumbers(average)) : 0;
  const [amount, setAmount] = useState<string>('');
  const [bankName, setBankName] = useState<string>(seller?.bankAccount?.bankName || '');
  const [accountNumber, setAccountNumber] = useState<string>(seller?.bankAccount?.accountNumber || '');
  const [accountName, setAccountName] = useState<string>(seller?.bankAccount?.accountName || '');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [createWithdrawal, { isLoading }] = useCreateWithdrawalMutation();
  const availableBalance = toVndInteger(seller?.availableBalance);

  useEffect(() => {
    setBankName(seller?.bankAccount?.bankName || '');
    setAccountNumber(seller?.bankAccount?.accountNumber || '');
    setAccountName(seller?.bankAccount?.accountName || '');
  }, [seller]);

  const onCreateWithdrawal = async (): Promise<void> => {
    try {
      const parsedAmount = Number(amount);
      if (!seller?._id) {
        showErrorToast('Thiếu hồ sơ người bán.');
        return;
      }

      const nextErrors: Record<string, string> = {};
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || !Number.isInteger(parsedAmount)) {
        nextErrors.amount = 'Nhập số tiền rút VND nguyên lớn hơn 0.';
      } else if (parsedAmount > availableBalance) {
        nextErrors.amount = 'Số tiền rút không được vượt quá số dư khả dụng.';
      }
      if (!bankName.trim()) {
        nextErrors.bankName = 'Tên ngân hàng là bắt buộc.';
      }
      if (!/^[0-9]{6,24}$/.test(accountNumber.trim())) {
        nextErrors.accountNumber = 'Số tài khoản phải gồm 6 đến 24 chữ số.';
      }
      if (!accountName.trim()) {
        nextErrors.accountName = 'Tên chủ tài khoản là bắt buộc.';
      }
      setFormErrors(nextErrors);
      if (Object.keys(nextErrors).length) {
        return;
      }

      await createWithdrawal({
        sellerId: seller._id,
        amount: parsedAmount,
        bankAccount: {
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          accountName: accountName.trim()
        }
      }).unwrap();
      setAmount('');
      setFormErrors({});
      showSuccessToast('Yêu cầu rút tiền đã được gửi đến email quản trị viên.');
    } catch (error) {
      if (isFetchBaseQueryError(error)) {
        showErrorToast(error?.data?.message || 'Không thể tạo yêu cầu rút tiền.');
        return;
      }
      showErrorToast('Không thể tạo yêu cầu rút tiền.');
    }
  };

  return (
    <div className="container mx-auto mt-8">
      <div className="flex flex-col flex-wrap">
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3">
          <div className="border border-grey flex items-center justify-center p-8 sm:col-span-1">
            <div className="flex flex-col gap-3">
              <span className="text-center text-base lg:text-xl">Doanh thu đến nay</span>
              <span className="text-center font-bold text-base md:text-xl lg:text-2xl truncate">{formatVnd(seller?.totalEarnings)}</span>
            </div>
          </div>
          <div className="border border-grey flex items-center justify-center p-8 sm:col-span-1">
            <div className="flex flex-col gap-3">
              <span className="text-center text-base lg:text-xl">Giá bán trung bình</span>
              <span className="text-center font-bold text-base md:text-xl lg:text-2xl truncate">{formatVnd(averageSellingPrice)}</span>
            </div>
          </div>
          <div className="border border-grey flex items-center justify-center p-8 sm:col-span-1">
            <div className="flex flex-col gap-3">
              <span className="text-center text-base lg:text-xl">Đơn đã hoàn thành</span>
              <span className="text-center font-bold text-base md:text-xl lg:text-2xl truncate">{seller?.completedJobs}</span>
            </div>
          </div>
        </div>

        <div className="mb-6 border border-grey bg-white p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-2">
            <h2 className="text-lg font-bold text-gray-900">Rút tiền</h2>
            <p className="text-sm text-gray-600">Gửi yêu cầu rút tiền đến email quản trị viên để xử lý thanh toán theo đợt.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Số dư khả dụng</label>
              <div className="rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700">{formatVnd(availableBalance)}</div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Số tiền rút</label>
              <input
                className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                type="number"
                min="1"
                max={availableBalance}
                step="1"
                value={amount}
                onChange={(event) => {
                  setAmount(event.target.value);
                  setFormErrors((currentErrors) => ({ ...currentErrors, amount: '' }));
                }}
                placeholder="Nhập số tiền"
              />
              {formErrors.amount && <p className="text-xs text-red-500">{formErrors.amount}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Tên ngân hàng</label>
              <input
                className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                type="text"
                value={bankName}
                onChange={(event) => {
                  setBankName(event.target.value);
                  setFormErrors((currentErrors) => ({ ...currentErrors, bankName: '' }));
                }}
                placeholder="VCB / MB / ACB..."
              />
              {formErrors.bankName && <p className="text-xs text-red-500">{formErrors.bankName}</p>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Số tài khoản</label>
              <input
                className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                type="text"
                value={accountNumber}
                onChange={(event) => {
                  setAccountNumber(event.target.value);
                  setFormErrors((currentErrors) => ({ ...currentErrors, accountNumber: '' }));
                }}
                placeholder="Số tài khoản ngân hàng"
              />
              {formErrors.accountNumber && <p className="text-xs text-red-500">{formErrors.accountNumber}</p>}
            </div>
            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="text-sm font-medium text-gray-700">Tên chủ tài khoản</label>
              <input
                className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                type="text"
                value={accountName}
                onChange={(event) => {
                  setAccountName(event.target.value);
                  setFormErrors((currentErrors) => ({ ...currentErrors, accountName: '' }));
                }}
                placeholder="TÊN CHỦ TÀI KHOẢN"
              />
              {formErrors.accountName && <p className="text-xs text-red-500">{formErrors.accountName}</p>}
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              className="rounded bg-sky-500 px-5 py-2 text-sm font-bold text-white hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-gray-400"
              label={isLoading ? 'Đang gửi...' : 'Yêu cầu rút tiền'}
              disabled={isLoading || availableBalance <= 0}
              onClick={onCreateWithdrawal}
            />
          </div>
        </div>

        <ManageEarningsTable type="active" orders={completedOrders} orderTypes={completedOrders.length} />
      </div>
    </div>
  );
};

export default ManageEarnings;
