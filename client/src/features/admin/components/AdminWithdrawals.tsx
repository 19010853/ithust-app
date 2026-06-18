import { ChangeEvent, FC, ReactElement, useMemo, useState } from 'react';
import { IWithdrawalDocument } from 'src/features/sellers/interfaces/seller.interface';
import { useGetWithdrawalsQuery, useUpdateWithdrawalStatusMutation } from 'src/features/sellers/services/seller.service';
import Button from 'src/shared/button/Button';
import { formatVnd } from 'src/shared/utils/currency.utils';
import { isFetchBaseQueryError, showErrorToast, showSuccessToast } from 'src/shared/utils/utils.service';

type WithdrawalStatus = 'PENDING' | 'COMPLETED' | 'REJECTED';

const statusOptions: WithdrawalStatus[] = ['PENDING', 'COMPLETED', 'REJECTED'];
const withdrawalStatusLabel: Record<WithdrawalStatus, string> = {
  PENDING: 'Chờ xử lý',
  COMPLETED: 'Đã hoàn tất',
  REJECTED: 'Đã từ chối'
};

const AdminWithdrawals: FC = (): ReactElement => {
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [q, setQ] = useState<string>('');
  const [bankName, setBankName] = useState<string>('');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [createdFrom, setCreatedFrom] = useState<string>('');
  const [createdTo, setCreatedTo] = useState<string>('');
  const [processedFrom, setProcessedFrom] = useState<string>('');
  const [processedTo, setProcessedTo] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<IWithdrawalDocument | null>(null);
  const [nextStatus, setNextStatus] = useState<'COMPLETED' | 'REJECTED'>('COMPLETED');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [adminNote, setAdminNote] = useState<string>('');
  const filters = useMemo(
    () => ({
      status: statusFilter,
      q,
      bankName,
      minAmount,
      maxAmount,
      createdFrom,
      createdTo,
      processedFrom,
      processedTo,
      page,
      limit: 20
    }),
    [bankName, createdFrom, createdTo, maxAmount, minAmount, page, processedFrom, processedTo, q, statusFilter]
  );
  const { data, isLoading, isFetching } = useGetWithdrawalsQuery(filters);
  const [updateWithdrawalStatus, { isLoading: isUpdating }] = useUpdateWithdrawalStatusMutation();

  const withdrawals = (data?.withdrawals || []) as IWithdrawalDocument[];
  const pagination = data?.pagination;

  const resetPageOnChange = (setter: (value: string) => void) => (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    setter(event.target.value);
    setPage(1);
  };

  const openStatusModal = (withdrawal: IWithdrawalDocument, status: 'COMPLETED' | 'REJECTED'): void => {
    setSelectedWithdrawal(withdrawal);
    setNextStatus(status);
    setPaymentReference('');
    setAdminNote('');
  };

  const closeStatusModal = (): void => {
    setSelectedWithdrawal(null);
    setPaymentReference('');
    setAdminNote('');
  };

  const onUpdateStatus = async (): Promise<void> => {
    if (!selectedWithdrawal?._id) {
      return;
    }

    try {
      await updateWithdrawalStatus({
        withdrawalId: selectedWithdrawal._id,
        status: nextStatus,
        paymentReference: paymentReference.trim(),
        adminNote: adminNote.trim()
      }).unwrap();
      showSuccessToast(`Đã đánh dấu yêu cầu rút tiền là ${withdrawalStatusLabel[nextStatus].toLowerCase()}.`);
      closeStatusModal();
    } catch (error) {
      if (isFetchBaseQueryError(error)) {
        showErrorToast(error?.data?.message || 'Không thể cập nhật yêu cầu rút tiền.');
        return;
      }
      showErrorToast('Không thể cập nhật yêu cầu rút tiền.');
    }
  };

  const formatDate = (value?: Date | string | null): string => {
    if (!value) {
      return '-';
    }
    return new Date(value).toLocaleString();
  };

  const sellerName = (withdrawal: IWithdrawalDocument): string => {
    if (typeof withdrawal.sellerId === 'object') {
      return withdrawal.sellerId.fullName || withdrawal.sellerId.username || '-';
    }
    return `${withdrawal.sellerId || '-'}`;
  };

  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yêu cầu rút tiền</h1>
          <p className="text-sm text-gray-600">Xem xét yêu cầu thanh toán của người bán và ghi nhận kết quả chuyển khoản thủ công.</p>
        </div>
        <div className="text-sm text-gray-500">
          Tìm thấy {pagination?.total || 0} yêu cầu
        </div>
      </div>

      <div className="mb-4 grid gap-3 bg-white p-4 md:grid-cols-4">
        <input
          className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
          placeholder="Tìm người bán hoặc tài khoản ngân hàng"
          value={q}
          onChange={resetPageOnChange(setQ)}
        />
        <select
          className="rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500"
          value={statusFilter}
          onChange={resetPageOnChange(setStatusFilter)}
        >
          <option value="">Tất cả trạng thái</option>
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {withdrawalStatusLabel[status]}
            </option>
          ))}
        </select>
        <input
          className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
          placeholder="Ngân hàng"
          value={bankName}
          onChange={resetPageOnChange(setBankName)}
        />
        <div className="grid grid-cols-2 gap-2">
          <input
            className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
            placeholder="Số tiền tối thiểu"
            value={minAmount}
            onChange={resetPageOnChange(setMinAmount)}
          />
          <input
            className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
            placeholder="Số tiền tối đa"
            value={maxAmount}
            onChange={resetPageOnChange(setMaxAmount)}
          />
        </div>
        <label className="flex flex-col gap-1 text-xs text-gray-500">
          Yêu cầu từ ngày
          <input className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-sky-500" type="date" value={createdFrom} onChange={resetPageOnChange(setCreatedFrom)} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-500">
          Yêu cầu đến ngày
          <input className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-sky-500" type="date" value={createdTo} onChange={resetPageOnChange(setCreatedTo)} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-500">
          Xử lý từ ngày
          <input className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-sky-500" type="date" value={processedFrom} onChange={resetPageOnChange(setProcessedFrom)} />
        </label>
        <label className="flex flex-col gap-1 text-xs text-gray-500">
          Xử lý đến ngày
          <input className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-sky-500" type="date" value={processedTo} onChange={resetPageOnChange(setProcessedTo)} />
        </label>
      </div>

      <div className="overflow-x-auto border border-grey bg-white">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b border-grey bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3">Người bán</th>
              <th className="px-4 py-3">Số tiền</th>
              <th className="px-4 py-3">Ngân hàng</th>
              <th className="px-4 py-3">Tài khoản</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Ngày yêu cầu</th>
              <th className="px-4 py-3">Ngày xử lý</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {(isLoading || isFetching) && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={8}>
                  Đang tải yêu cầu rút tiền...
                </td>
              </tr>
            )}
            {!isLoading &&
              !isFetching &&
              withdrawals.map((withdrawal) => (
                <tr key={withdrawal._id} className="border-b border-grey last:border-b-0">
                  <td className="px-4 py-3 font-medium text-gray-900">{sellerName(withdrawal)}</td>
                  <td className="px-4 py-3">{formatVnd(withdrawal.amount)}</td>
                  <td className="px-4 py-3">{withdrawal.bankInfo?.bankName || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{withdrawal.bankInfo?.accountNumber || '-'}</div>
                    <div className="text-xs text-gray-500">{withdrawal.bankInfo?.accountName || '-'}</div>
                  </td>
                  <td className="px-4 py-3">{withdrawalStatusLabel[withdrawal.status as WithdrawalStatus] || withdrawal.status}</td>
                  <td className="px-4 py-3">{formatDate(withdrawal.createdAt)}</td>
                  <td className="px-4 py-3">{formatDate(withdrawal.processedDate)}</td>
                  <td className="px-4 py-3">
                    {withdrawal.status === 'PENDING' ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          className="rounded bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500"
                          label="Đánh dấu hoàn tất"
                          onClick={() => openStatusModal(withdrawal, 'COMPLETED')}
                        />
                        <Button
                          className="rounded bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-500"
                          label="Từ chối"
                          onClick={() => openStatusModal(withdrawal, 'REJECTED')}
                        />
                      </div>
                    ) : (
                      <div className="text-right text-xs text-gray-500">{withdrawal.paymentReference || withdrawal.adminNote || '-'}</div>
                    )}
                  </td>
                </tr>
              ))}
            {!isLoading && !isFetching && !withdrawals.length && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={8}>
                  Không tìm thấy yêu cầu rút tiền.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span>
          Trang {pagination?.page || page} / {pagination?.totalPages || 1}
        </span>
        <div className="flex gap-2">
          <Button
            className="rounded border border-gray-300 px-3 py-1 font-bold text-gray-700 disabled:opacity-40"
            label="Trước"
            disabled={page <= 1}
            onClick={() => setPage((value) => Math.max(value - 1, 1))}
          />
          <Button
            className="rounded border border-gray-300 px-3 py-1 font-bold text-gray-700 disabled:opacity-40"
            label="Sau"
            disabled={page >= (pagination?.totalPages || 1)}
            onClick={() => setPage((value) => value + 1)}
          />
        </div>
      </div>

      {selectedWithdrawal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg bg-white p-5 shadow-xl">
            <h2 className="mb-2 text-lg font-bold text-gray-900">Đánh dấu yêu cầu là {withdrawalStatusLabel[nextStatus].toLowerCase()}</h2>
            <p className="mb-4 text-sm text-gray-600">
              Yêu cầu {selectedWithdrawal._id} với số tiền {formatVnd(selectedWithdrawal.amount)}
            </p>
            <div className="mb-3 flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Mã tham chiếu thanh toán</label>
              <input
                className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                value={paymentReference}
                onChange={(event) => setPaymentReference(event.target.value)}
                placeholder="Mã giao dịch hoặc mã tham chiếu ngân hàng"
              />
            </div>
            <div className="mb-5 flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Ghi chú admin</label>
              <textarea
                className="min-h-[100px] rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                value={adminNote}
                onChange={(event) => setAdminNote(event.target.value)}
                placeholder="Ghi chú tùy chọn cho log kiểm duyệt và email gửi người bán"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button className="rounded border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700" label="Hủy" onClick={closeStatusModal} />
              <Button
                className="rounded bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-gray-400"
                label={isUpdating ? 'Đang lưu...' : `Xác nhận ${withdrawalStatusLabel[nextStatus].toLowerCase()}`}
                disabled={isUpdating}
                onClick={onUpdateStatus}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminWithdrawals;
