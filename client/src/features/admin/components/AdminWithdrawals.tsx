import { FC, ReactElement, useState } from 'react';
import { IWithdrawalDocument } from 'src/features/sellers/interfaces/seller.interface';
import { useGetWithdrawalsQuery, useUpdateWithdrawalStatusMutation } from 'src/features/sellers/services/seller.service';
import Button from 'src/shared/button/Button';
import { isFetchBaseQueryError, showErrorToast, showSuccessToast } from 'src/shared/utils/utils.service';

type WithdrawalStatus = 'PENDING' | 'COMPLETED' | 'REJECTED';

const statusOptions: WithdrawalStatus[] = ['PENDING', 'COMPLETED', 'REJECTED'];

const AdminWithdrawals: FC = (): ReactElement => {
  const [statusFilter, setStatusFilter] = useState<WithdrawalStatus>('PENDING');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<IWithdrawalDocument | null>(null);
  const [nextStatus, setNextStatus] = useState<'COMPLETED' | 'REJECTED'>('COMPLETED');
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [adminNote, setAdminNote] = useState<string>('');
  const { data, isLoading, isFetching } = useGetWithdrawalsQuery(statusFilter);
  const [updateWithdrawalStatus, { isLoading: isUpdating }] = useUpdateWithdrawalStatusMutation();

  const withdrawals = (data?.withdrawals || []) as IWithdrawalDocument[];

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
      showSuccessToast(`Withdrawal marked as ${nextStatus}.`);
      closeStatusModal();
    } catch (error) {
      if (isFetchBaseQueryError(error)) {
        showErrorToast(error?.data?.message || 'Unable to update withdrawal.');
        return;
      }
      showErrorToast('Unable to update withdrawal.');
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
          <h1 className="text-2xl font-bold text-gray-900">Withdrawal Requests</h1>
          <p className="text-sm text-gray-600">Review seller payout requests and record manual payment outcomes.</p>
        </div>
        <select
          className="w-full rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500 sm:w-48"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as WithdrawalStatus)}
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto border border-grey bg-white">
        <table className="w-full min-w-[980px] text-left text-sm">
          <thead className="border-b border-grey bg-gray-50 text-xs uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3">Seller</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Bank</th>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Requested</th>
              <th className="px-4 py-3">Processed</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(isLoading || isFetching) && (
              <tr>
                <td className="px-4 py-6 text-center text-gray-500" colSpan={8}>
                  Loading withdrawals...
                </td>
              </tr>
            )}
            {!isLoading &&
              !isFetching &&
              withdrawals.map((withdrawal) => (
                <tr key={withdrawal._id} className="border-b border-grey last:border-b-0">
                  <td className="px-4 py-3 font-medium text-gray-900">{sellerName(withdrawal)}</td>
                  <td className="px-4 py-3">${withdrawal.amount}</td>
                  <td className="px-4 py-3">{withdrawal.bankInfo?.bankName || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{withdrawal.bankInfo?.accountNumber || '-'}</div>
                    <div className="text-xs text-gray-500">{withdrawal.bankInfo?.accountName || '-'}</div>
                  </td>
                  <td className="px-4 py-3">{withdrawal.status}</td>
                  <td className="px-4 py-3">{formatDate(withdrawal.createdAt)}</td>
                  <td className="px-4 py-3">{formatDate(withdrawal.processedDate)}</td>
                  <td className="px-4 py-3">
                    {withdrawal.status === 'PENDING' ? (
                      <div className="flex justify-end gap-2">
                        <Button
                          className="rounded bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500"
                          label="Mark completed"
                          onClick={() => openStatusModal(withdrawal, 'COMPLETED')}
                        />
                        <Button
                          className="rounded bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-500"
                          label="Reject"
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
                  No withdrawals found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedWithdrawal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg bg-white p-5 shadow-xl">
            <h2 className="mb-2 text-lg font-bold text-gray-900">Mark withdrawal as {nextStatus}</h2>
            <p className="mb-4 text-sm text-gray-600">
              Withdrawal {selectedWithdrawal._id} for ${selectedWithdrawal.amount}
            </p>
            <div className="mb-3 flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Payment reference</label>
              <input
                className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                value={paymentReference}
                onChange={(event) => setPaymentReference(event.target.value)}
                placeholder="Bank transaction/reference code"
              />
            </div>
            <div className="mb-5 flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Admin note</label>
              <textarea
                className="min-h-[100px] rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
                value={adminNote}
                onChange={(event) => setAdminNote(event.target.value)}
                placeholder="Optional note for audit and seller email"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button className="rounded border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700" label="Cancel" onClick={closeStatusModal} />
              <Button
                className="rounded bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-gray-400"
                label={isUpdating ? 'Saving...' : `Confirm ${nextStatus}`}
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
