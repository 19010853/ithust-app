import { FC, ReactElement, useState } from 'react';
import {
  useCreateDisputeMessageMutation,
  useDecideDisputeMutation,
  useGetDisputeMessagesQuery,
  useGetDisputesQuery
} from 'src/features/order/services/order.service';
import { IDisputeDocument } from 'src/features/order/interfaces/order.interface';
import Button from 'src/shared/button/Button';
import { showErrorToast, showSuccessToast } from 'src/shared/utils/utils.service';

const AdminDisputes: FC = (): ReactElement => {
  const { data } = useGetDisputesQuery(undefined);
  const disputes = data?.disputes || [];
  const [selected, setSelected] = useState<IDisputeDocument | null>(null);
  const [message, setMessage] = useState('');
  const [reason, setReason] = useState('');
  const [decision, setDecision] = useState<'REVISION_REQUIRED' | 'REFUND_BUYER' | 'RELEASE_SELLER'>('REVISION_REQUIRED');
  const { data: messageData } = useGetDisputeMessagesQuery(selected?._id || '', { skip: !selected?._id });
  const [sendMessage] = useCreateDisputeMessageMutation();
  const [decide] = useDecideDisputeMutation();

  const submitMessage = async (): Promise<void> => {
    if (!selected?._id || !message.trim()) return;
    try {
      await sendMessage({ disputeId: selected._id, body: message.trim() }).unwrap();
      setMessage('');
    } catch { showErrorToast('Không thể gửi tin nhắn tranh chấp.'); }
  };

  const submitDecision = async (): Promise<void> => {
    if (!selected?._id || reason.trim().length < 5) return;
    try {
      const revisionDeadlineAt = decision === 'REVISION_REQUIRED' ? new Date(Date.now() + 48 * 3600000).toISOString() : undefined;
      await decide({ disputeId: selected._id, decision, reason: reason.trim(), revisionDeadlineAt }).unwrap();
      showSuccessToast('Đã cập nhật quyết định tranh chấp.');
      setSelected(null);
    } catch { showErrorToast('Không thể quyết định tranh chấp.'); }
  };

  return (
    <div className="container mx-auto mt-8 px-4">
      <h1 className="mb-5 text-2xl font-bold">Tranh chấp đơn hàng</h1>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-3">
          {disputes.map((item) => (
            <button key={item._id} className="w-full rounded border p-4 text-left hover:border-sky-500" onClick={() => setSelected(item)}>
              <div className="font-bold">#{item.orderId} · {item.status}</div>
              <div className="text-sm">{item.buyerUsername} ↔ {item.sellerUsername}</div>
              <p className="mt-2 text-sm text-gray-600">{item.reason}</p>
            </button>
          ))}
          {!disputes.length && <p>Không có tranh chấp.</p>}
        </div>
        {selected && (
          <div className="rounded border p-4">
            <h2 className="mb-3 font-bold">Trao đổi #{selected.orderId}</h2>
            <div className="mb-3 max-h-72 space-y-2 overflow-y-auto bg-gray-50 p-3">
              {(messageData?.disputeMessages || []).map((item) => (
                <div key={item._id} className="rounded bg-white p-2 text-sm">
                  <strong>{item.senderUsername} ({item.senderRole})</strong><p>{item.body}</p>
                </div>
              ))}
            </div>
            <textarea className="w-full rounded border p-2" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Nhắn buyer/seller" />
            <Button className="mt-2 rounded bg-sky-500 px-3 py-2 text-white" label="Gửi tin nhắn" onClick={submitMessage} />
            <hr className="my-4" />
            <select className="w-full rounded border p-2" value={decision} onChange={(e) => setDecision(e.target.value as typeof decision)}>
              <option value="REVISION_REQUIRED">Yêu cầu sửa lại</option>
              <option value="REFUND_BUYER">Hoàn tiền buyer</option>
              <option value="RELEASE_SELLER">Giải phóng tiền seller</option>
            </select>
            <textarea className="mt-2 w-full rounded border p-2" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Lý do quyết định" />
            <Button className="mt-2 rounded bg-emerald-600 px-3 py-2 text-white" label="Xác nhận quyết định" onClick={submitDecision} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDisputes;
