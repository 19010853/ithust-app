import { ChangeEvent, FC, ReactElement, useState } from 'react';
import Button from 'src/shared/button/Button';
import TextAreaInput from 'src/shared/inputs/TextAreaInput';
import { showErrorToast, showSuccessToast } from 'src/shared/utils/utils.service';

import { IOrderDocument } from '../interfaces/order.interface';
import { useCreateDisputeMutation, useGetDisputesQuery } from '../services/order.service';

const QualityDisputeRequest: FC<{ order: IOrderDocument; username: string }> = ({ order, username }): ReactElement | null => {
  const [reason, setReason] = useState<string>('');
  const [createDispute, { isLoading }] = useCreateDisputeMutation();
  const { data } = useGetDisputesQuery(undefined);
  const existingDispute = data?.disputes?.find((dispute) => dispute.orderId === order.orderId);

  const canRequestAdminReview =
    order.buyerUsername === username &&
    order.paymentStatus === 'HELD' &&
    ['Delivered', 'delivered'].includes(order.status) &&
    Boolean(order.delivered) &&
    !order.approved &&
    !existingDispute;

  if (!canRequestAdminReview) {
    return null;
  }

  const submitDispute = async (): Promise<void> => {
    try {
      await createDispute({ orderId: order.orderId, reason: reason.trim() }).unwrap();
      setReason('');
      showSuccessToast('Yêu cầu xem xét hoàn tiền đã được gửi đến admin.');
    } catch (error) {
      showErrorToast('Không thể gửi yêu cầu xem xét hoàn tiền.');
    }
  };

  return (
    <div className="mt-4 bg-white p-4">
      <div className="mb-3">
        <h3 className="text-base font-bold text-gray-900">Yêu cầu admin xem xét hoàn tiền</h3>
        <p className="mt-1 text-sm text-gray-600">
          Chỉ gửi yêu cầu này khi bạn đã xem bàn giao nhưng chất lượng chưa tương xứng. Admin sẽ trao đổi với hai bên trước khi quyết định.
        </p>
      </div>
      <TextAreaInput
        className="border-grey w-full rounded border p-3 text-sm outline-none focus:border-sky-500"
        rows={4}
        maxLength={1000}
        value={reason}
        placeholder="Mô tả vấn đề chất lượng bạn gặp phải"
        onChange={(event: ChangeEvent) => setReason((event.target as HTMLTextAreaElement).value)}
      />
      <div className="mt-3 flex justify-end">
        <Button
          className="rounded bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-gray-400"
          label={isLoading ? 'Đang gửi...' : 'Gửi admin xem xét'}
          disabled={isLoading || reason.trim().length < 10}
          onClick={submitDispute}
        />
      </div>
    </div>
  );
};

export default QualityDisputeRequest;
