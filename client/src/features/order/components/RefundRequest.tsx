import { ChangeEvent, FC, ReactElement, useState } from 'react';
import Button from 'src/shared/button/Button';
import TextAreaInput from 'src/shared/inputs/TextAreaInput';
import { showErrorToast, showSuccessToast } from 'src/shared/utils/utils.service';

import { IOrderDocument, IRefundRequestPayload } from '../interfaces/order.interface';
import { useCreateRefundRequestMutation } from '../services/order.service';

const emptyRefund: IRefundRequestPayload = {
  reason: ''
};

const inputClass = 'border-grey w-full rounded border p-3 text-sm text-gray-700 focus:outline-none';

const RefundRequest: FC<{ order: IOrderDocument }> = ({ order }): ReactElement | null => {
  const [refund, setRefund] = useState<IRefundRequestPayload>(emptyRefund);
  const [open, setOpen] = useState<boolean>(false);
  const [createRefundRequest, { isLoading }] = useCreateRefundRequestMutation();

  const hasPendingExtension = Boolean(order.requestExtension?.newDate);
  const isBeforeDeadline = new Date(`${order.offer?.newDeliveryDate || ''}`).getTime() > Date.now();

  if (order.paymentStatus !== 'HELD' || order.approved || order.delivered || !hasPendingExtension || !isBeforeDeadline) {
    return null;
  }

  const submitRefund = async (): Promise<void> => {
    try {
      await createRefundRequest({ orderId: order.orderId, body: refund }).unwrap();
      setOpen(false);
      showSuccessToast('Yêu cầu hoàn tiền đã được gửi. Stripe sẽ hoàn về phương thức thanh toán ban đầu.');
    } catch (error) {
      showErrorToast('Không thể tạo yêu cầu hoàn tiền.');
    }
  };

  return (
    <div className="mt-4 border-grey border bg-white p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h3 className="text-base font-bold text-black">Thanh toan dang duoc nen tang giu</h3>
          <p className="text-sm text-gray-600">Yêu cầu hoàn tiền qua Stripe về đúng phương thức thanh toán ban đầu.</p>
        </div>
        <Button
          className="rounded bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-400"
          label={open ? 'Đóng biểu mẫu hoàn tiền' : 'Yêu cầu hoàn tiền'}
          onClick={() => setOpen(!open)}
        />
      </div>
      {open && (
        <div className="mt-4 grid gap-3">
          <TextAreaInput
            name="reason"
            rows={4}
            value={refund.reason}
            placeholder="Lý do yêu cầu hoàn tiền"
            className={inputClass}
            onChange={(event: ChangeEvent) => setRefund({ ...refund, reason: (event.target as HTMLTextAreaElement).value })}
          />
          <Button
            className="w-fit rounded bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-400 disabled:opacity-60"
            label={isLoading ? 'Đang gửi...' : 'Gửi yêu cầu hoàn tiền'}
            disabled={isLoading || refund.reason.trim().length < 10}
            onClick={submitRefund}
          />
        </div>
      )}
    </div>
  );
};

export default RefundRequest;
