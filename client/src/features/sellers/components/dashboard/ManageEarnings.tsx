import { filter, sumBy } from 'lodash';
import { FC, ReactElement, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { IOrderDocument } from 'src/features/order/interfaces/order.interface';
import Button from 'src/shared/button/Button';
import {
  formatVnd,
  formatVndNumber,
  parseVndInput,
  PAYOUT_MAX_AMOUNT_PER_REQUEST_VND,
  PAYOUT_MIN_AMOUNT_VND,
  toVndInteger
} from 'src/shared/utils/currency.utils';
import {
  isFetchBaseQueryError,
  normalizeOrderStatus,
  showErrorToast,
  showSuccessToast,
  stripeDisabledReasonLabel
} from 'src/shared/utils/utils.service';

import { ISellerDocument, SellerContextType } from '../../interfaces/seller.interface';
import { useCreateStripeAccountLinkMutation, useCreateWithdrawalMutation, useGetStripeAccountStatusQuery } from '../../services/seller.service';
import ManageEarningsTable from './components/ManageEarningsTable';

const stripeStatusText = (seller?: ISellerDocument | null): { title: string; body: string; tone: string; action: string } => {
  if (!seller?.stripeAccountId) {
    return {
      title: 'Chưa thiết lập Stripe Connect',
      body: 'Bạn cần tạo tài khoản Stripe Connected Account, hoàn tất KYC và thêm tài khoản ngân hàng trong Stripe trước khi rút tiền.',
      tone: 'border-amber-300 bg-amber-50 text-amber-800',
      action: 'Thiết lập Stripe'
    };
  }
  if (seller.stripePayoutReadiness === 'READY') {
    return {
      title: 'Đã đủ điều kiện nhận payout',
      body: 'Stripe đã xác minh tài khoản, bật payout và ghi nhận phương thức nhận tiền. Bạn có thể gửi yêu cầu rút tiền.',
      tone: 'border-emerald-300 bg-emerald-50 text-emerald-800',
      action: 'Cập nhật thông tin Stripe'
    };
  }
  return {
    title: 'Cần hoàn tất xác minh',
    body: 'Stripe vẫn cần thêm thông tin KYC hoặc tài khoản nhận tiền. Hãy tiếp tục onboarding để mở quyền payout.',
    tone: 'border-sky-300 bg-sky-50 text-sky-800',
    action: 'Tiếp tục xác minh'
  };
};

const ManageEarnings: FC = (): ReactElement => {
  const { orders, seller } = useOutletContext<SellerContextType>();
  const completedOrders: IOrderDocument[] = filter(
    orders,
    (order: IOrderDocument) => normalizeOrderStatus(order.status) === 'delivered' && order.paymentStatus === 'HELD'
  );
  const sum: number = sumBy(completedOrders, 'price');
  const averageSellingPrice: number = completedOrders.length ? Math.round(sum / completedOrders.length) : 0;
  const [amount, setAmount] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [createWithdrawal, { isLoading }] = useCreateWithdrawalMutation();
  const [createStripeAccountLink, { isLoading: isCreatingStripeLink }] = useCreateStripeAccountLinkMutation();
  const { data: stripeStatusData, isFetching: isRefreshingStripeStatus } = useGetStripeAccountStatusQuery(seller?._id || '', {
    skip: !seller?._id
  });

  const stripeSeller = (stripeStatusData?.seller || seller) as ISellerDocument | null;
  const availableBalance = toVndInteger(stripeSeller?.availableBalance);
  const stripeReady = stripeSeller?.stripePayoutReadiness === 'READY';
  const stripePanel = stripeStatusText(stripeSeller);

  const onOpenStripeOnboarding = async (): Promise<void> => {
    if (!seller?._id) {
      showErrorToast('Thiếu hồ sơ người bán.');
      return;
    }

    try {
      const response = await createStripeAccountLink(seller._id).unwrap();
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      if (isFetchBaseQueryError(error)) {
        showErrorToast(error?.data?.message || 'Không thể tạo liên kết Stripe onboarding.');
        return;
      }
      showErrorToast('Không thể tạo liên kết Stripe onboarding.');
    }
  };

  const onCreateWithdrawal = async (): Promise<void> => {
    try {
      const parsedAmount = Number(parseVndInput(amount));
      if (!seller?._id) {
        showErrorToast('Thiếu hồ sơ người bán.');
        return;
      }
      if (!stripeReady) {
        showErrorToast('Bạn cần hoàn tất Stripe Connect trước khi rút tiền.');
        return;
      }

      const nextErrors: Record<string, string> = {};
      if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || !Number.isInteger(parsedAmount)) {
        nextErrors.amount = 'Nhập số tiền rút VND nguyên lớn hơn 0.';
      } else if (parsedAmount < PAYOUT_MIN_AMOUNT_VND) {
        nextErrors.amount = `Số tiền rút tối thiểu là ${formatVnd(PAYOUT_MIN_AMOUNT_VND)}.`;
      }
      setFormErrors(nextErrors);
      if (Object.keys(nextErrors).length) {
        return;
      }

      await createWithdrawal({
        sellerId: seller._id,
        amount: parsedAmount
      }).unwrap();
      setAmount('');
      setFormErrors({});
      showSuccessToast('Yêu cầu rút tiền đã được gửi sang Stripe. Hệ thống sẽ cập nhật khi payout hoàn tất.');
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
              <span className="text-center font-bold text-base md:text-xl lg:text-2xl truncate">{formatVnd(stripeSeller?.totalEarnings)}</span>
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
              <span className="text-center font-bold text-base md:text-xl lg:text-2xl truncate">{stripeSeller?.completedJobs}</span>
            </div>
          </div>
        </div>

        <div className={`mb-4 border p-4 sm:p-5 ${stripePanel.tone}`}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-bold">{stripePanel.title}</h2>
              <p className="mt-1 text-sm">{stripePanel.body}</p>
              {stripeSeller?.stripeRequirementsDisabledReason && (
                <p className="mt-1 text-xs">Lý do hạn chế: {stripeDisabledReasonLabel(stripeSeller.stripeRequirementsDisabledReason)}</p>
              )}
            </div>
            <Button
              className="rounded bg-gray-900 px-4 py-2 text-sm font-bold text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:bg-gray-400"
              label={isCreatingStripeLink || isRefreshingStripeStatus ? 'Đang xử lý...' : stripePanel.action}
              disabled={isCreatingStripeLink || isRefreshingStripeStatus || !seller?._id}
              onClick={onOpenStripeOnboarding}
            />
          </div>
        </div>

        <div className="mb-6 border border-grey bg-white p-4 sm:p-6">
          <div className="mb-4 flex flex-col gap-2">
            <h2 className="text-lg font-bold text-gray-900">Rút tiền</h2>
            <p className="text-sm text-gray-600">Số tiền sẽ được chuyển qua Stripe Connect sau khi tài khoản đủ điều kiện payout.</p>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Số dư khả dụng</label>
              <div className="rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-700">{formatVnd(availableBalance)}</div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Số tiền rút</label>
              <input
                className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-sky-500 disabled:bg-gray-100"
                type="text"
                inputMode="numeric"
                min={PAYOUT_MIN_AMOUNT_VND}
                max={Math.min(availableBalance, PAYOUT_MAX_AMOUNT_PER_REQUEST_VND)}
                step="1"
                value={amount ? formatVndNumber(amount) : ''}
                disabled={!stripeReady}
                onChange={(event) => {
                  const parsed = parseVndInput(event.target.value);
                  const numericValue = Number(parsed);
                  const cappedMax = Math.min(availableBalance, PAYOUT_MAX_AMOUNT_PER_REQUEST_VND);
                  setAmount(numericValue > cappedMax ? String(cappedMax) : parsed);
                  setFormErrors((currentErrors) => ({ ...currentErrors, amount: '' }));
                }}
                placeholder="Nhập số tiền"
              />
              {formErrors.amount && <p className="text-xs text-red-500">{formErrors.amount}</p>}
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
            {!stripeReady && <p className="text-sm text-gray-600">Hoàn tất Stripe Connect để bật yêu cầu rút tiền.</p>}
            <Button
              className="rounded bg-sky-500 px-5 py-2 text-sm font-bold text-white hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-gray-400"
              label={isLoading ? 'Đang gửi...' : 'Yêu cầu rút tiền'}
              disabled={isLoading || !stripeReady || availableBalance <= 0}
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
