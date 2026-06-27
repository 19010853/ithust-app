import { FC, ReactElement, useMemo, useState } from 'react';
import Button from 'src/shared/button/Button';
import { showErrorToast } from 'src/shared/utils/utils.service';
import { IOrderDocument } from '../interfaces/order.interface';
import {
  useCreateDisputeMessageMutation,
  useGetDisputeMessagesQuery,
  useGetDisputesQuery
} from '../services/order.service';

const disputeStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    OPEN: 'Đang mở',
    SELLER_RESPONSE_REQUIRED: 'Chờ seller phản hồi',
    REVISION_REQUIRED: 'Cần chỉnh sửa',
    REFUND_BUYER: 'Đã chấp nhận hoàn tiền',
    RELEASE_SELLER: 'Không chấp nhận hoàn tiền',
    CLOSED: 'Đã đóng'
  };
  return labels[status] || status;
};

const DisputeConversation: FC<{ order: IOrderDocument }> = ({ order }): ReactElement | null => {
  const [body, setBody] = useState('');
  const { data } = useGetDisputesQuery(undefined);
  const dispute = useMemo(() => data?.disputes?.find((item) => item.orderId === order.orderId), [data?.disputes, order.orderId]);
  const { data: messageData } = useGetDisputeMessagesQuery(dispute?._id || '', { skip: !dispute?._id });
  const [sendMessage, { isLoading }] = useCreateDisputeMessageMutation();

  if (!dispute) return null;

  const submit = async (): Promise<void> => {
    if (!body.trim()) return;
    try {
      await sendMessage({ disputeId: dispute._id!, body: body.trim() }).unwrap();
      setBody('');
    } catch {
      showErrorToast('Không thể gửi phản hồi tranh chấp.');
    }
  };

  return (
    <section className="mt-4 rounded border border-amber-300 bg-amber-50 p-4">
      <h3 className="font-bold">Trao đổi tranh chấp #{order.orderId}</h3>
      <p className="mb-3 text-sm text-gray-600">Trạng thái: {disputeStatusLabel(dispute.status)}</p>
      <div className="mb-3 max-h-64 space-y-2 overflow-y-auto">
        {(messageData?.disputeMessages || []).map((message) => (
          <div key={message._id} className="rounded bg-white p-2 text-sm">
            <strong>{message.senderUsername} ({message.senderRole})</strong>
            <p>{message.body}</p>
          </div>
        ))}
      </div>
      <textarea
        className="w-full rounded border p-2"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Phản hồi buyer, seller hoặc quản trị viên"
      />
      <Button className="mt-2 rounded bg-sky-500 px-3 py-2 text-white" disabled={isLoading} label={isLoading ? 'Đang gửi...' : 'Gửi phản hồi'} onClick={submit} />
    </section>
  );
};

export default DisputeConversation;
