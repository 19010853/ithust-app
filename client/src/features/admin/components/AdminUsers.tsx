import { ChangeEvent, FC, ReactElement, useMemo, useState } from 'react';
import Button from 'src/shared/button/Button';
import { isFetchBaseQueryError, showErrorToast, showSuccessToast } from 'src/shared/utils/utils.service';

import { IAdminUserSearchItem, IRestrictionPreview, IRestrictionStatusPayload } from '../interfaces/admin.interface';
import {
  useGetAdminUserDetailQuery,
  useGetAdminUsersQuery,
  useGetRestrictionPreviewQuery,
  useUpdateAccountStatusMutation,
  useUpdateSellerStatusMutation
} from '../services/admin.service';

const getQueryErrorMessage = (error: unknown, fallback: string): string => {
  if (typeof error === 'object' && error !== null && 'data' in error) {
    const data = (error as { data?: unknown }).data;
    if (typeof data === 'string') {
      return data;
    }
    if (typeof data === 'object' && data !== null && 'message' in data) {
      return `${(data as { message?: unknown }).message || fallback}`;
    }
  }

  return fallback;
};

const AdminUsers: FC = (): ReactElement => {
  const [q, setQ] = useState<string>('');
  const [country, setCountry] = useState<string>('');
  const [isSeller, setIsSeller] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [selectedUsername, setSelectedUsername] = useState<string>('');
  const [statusAction, setStatusAction] = useState<{
    label: string;
    scope: 'account' | 'seller';
    status: IRestrictionStatusPayload['status'];
  } | null>(null);
  const [statusReason, setStatusReason] = useState<string>('');
  const params = useMemo(() => ({ q, country, isSeller, page, limit: 20 }), [country, isSeller, page, q]);
  const { data, isLoading, isFetching, isError, error } = useGetAdminUsersQuery(params);
  const {
    data: detailData,
    isFetching: isDetailFetching,
    isError: isDetailError,
    error: detailError
  } = useGetAdminUserDetailQuery(selectedUsername, { skip: !selectedUsername });
  const { data: previewData, isFetching: isPreviewFetching } = useGetRestrictionPreviewQuery(selectedUsername, { skip: !selectedUsername || !statusAction });
  const [updateAccountStatus, { isLoading: isUpdatingAccount }] = useUpdateAccountStatusMutation();
  const [updateSellerStatus, { isLoading: isUpdatingSeller }] = useUpdateSellerStatusMutation();
  const users = (data?.users || []) as IAdminUserSearchItem[];
  const pagination = data?.pagination;
  const detail = detailData?.adminUser;
  const preview = previewData?.preview as IRestrictionPreview | undefined;
  const isUsersLoading = isLoading || isFetching;
  const usersErrorMessage = getQueryErrorMessage(error, 'Unable to load users.');
  const detailErrorMessage = getQueryErrorMessage(detailError, 'Unable to load user detail.');

  const onSearchChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setQ(event.target.value);
    setPage(1);
  };

  const formatDate = (value?: Date | string): string => {
    if (!value) {
      return '-';
    }
    return new Date(value).toLocaleDateString();
  };

  const money = (value?: number): string => `$${Number(value || 0).toFixed(2)}`;

  const openStatusAction = (scope: 'account' | 'seller', status: IRestrictionStatusPayload['status'], label: string): void => {
    setStatusAction({ scope, status, label });
    setStatusReason('');
  };

  const closeStatusAction = (): void => {
    setStatusAction(null);
    setStatusReason('');
  };

  const onSubmitStatusAction = async (): Promise<void> => {
    if (!selectedUsername || !statusAction || !statusReason.trim()) {
      showErrorToast('Reason is required.');
      return;
    }
    try {
      const body = { status: statusAction.status, reason: statusReason.trim() };
      if (statusAction.scope === 'account') {
        await updateAccountStatus({ username: selectedUsername, body }).unwrap();
      } else {
        await updateSellerStatus({ username: selectedUsername, body }).unwrap();
      }
      showSuccessToast(`${statusAction.label} completed.`);
      closeStatusAction();
    } catch (error) {
      if (isFetchBaseQueryError(error)) {
        showErrorToast(error?.data?.message || 'Unable to update status.');
        return;
      }
      showErrorToast('Unable to update status.');
    }
  };

  return (
    <div className="container mx-auto mt-8 px-4">
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-sm text-gray-600">Search buyers and sellers, then inspect account and seller details.</p>
      </div>

      <div className="mb-4 grid gap-3 bg-white p-4 md:grid-cols-[1fr_180px_180px]">
        <input
          className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
          placeholder="Search username, email, full name"
          value={q}
          onChange={onSearchChange}
        />
        <input
          className="rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
          placeholder="Country"
          value={country}
          onChange={(event) => {
            setCountry(event.target.value);
            setPage(1);
          }}
        />
        <select
          className="rounded border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-sky-500"
          value={isSeller}
          onChange={(event) => {
            setIsSeller(event.target.value);
            setPage(1);
          }}
        >
          <option value="">All users</option>
          <option value="true">Sellers only</option>
          <option value="false">Buyers only</option>
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="overflow-x-auto border border-grey bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-grey bg-gray-50 text-xs uppercase text-gray-600">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isUsersLoading && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={6}>
                    Loading users...
                  </td>
                </tr>
              )}
              {!isUsersLoading && isError && (
                <tr>
                  <td className="px-4 py-6 text-center text-red-600" colSpan={6}>
                    {usersErrorMessage}
                  </td>
                </tr>
              )}
              {!isUsersLoading &&
                !isError &&
                users.map((user) => (
                  <tr key={`${user.username}-${user.email}`} className="border-b border-grey last:border-b-0">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img className="h-9 w-9 rounded-full object-cover" src={user.profilePicture || 'https://placehold.co/80x80?text=U'} alt="" />
                        <div className="font-medium text-gray-900">{user.username || '-'}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3">{user.email || '-'}</td>
                    <td className="px-4 py-3">{user.country || '-'}</td>
                    <td className="px-4 py-3">{user.isSeller ? 'Seller' : 'Buyer'}</td>
                    <td className="px-4 py-3">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        className="rounded bg-sky-500 px-3 py-2 text-xs font-bold text-white hover:bg-sky-400"
                        label="View"
                        onClick={() => setSelectedUsername(`${user.username}`)}
                      />
                    </td>
                  </tr>
                ))}
              {!isUsersLoading && !isError && !users.length && (
                <tr>
                  <td className="px-4 py-6 text-center text-gray-500" colSpan={6}>
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex items-center justify-between border-t border-grey px-4 py-3 text-sm">
            <span>
              Page {pagination?.page || page} of {pagination?.totalPages || 1} ({pagination?.total || 0} users)
            </span>
            <div className="flex gap-2">
              <Button
                className="rounded border border-gray-300 px-3 py-1 font-bold text-gray-700 disabled:opacity-40"
                label="Prev"
                disabled={page <= 1}
                onClick={() => setPage((value) => Math.max(value - 1, 1))}
              />
              <Button
                className="rounded border border-gray-300 px-3 py-1 font-bold text-gray-700 disabled:opacity-40"
                label="Next"
                disabled={page >= (pagination?.totalPages || 1)}
                onClick={() => setPage((value) => value + 1)}
              />
            </div>
          </div>
        </div>

        <aside className="border border-grey bg-white p-4">
          <h2 className="mb-3 text-lg font-bold text-gray-900">User detail</h2>
          {!selectedUsername && <div className="text-sm text-gray-500">Select a user to inspect details.</div>}
          {selectedUsername && isDetailFetching && <div className="text-sm text-gray-500">Loading detail...</div>}
          {selectedUsername && !isDetailFetching && isDetailError && <div className="text-sm text-red-600">{detailErrorMessage}</div>}
          {detail && !isDetailFetching && !isDetailError && (
            <div className="space-y-4 text-sm">
              <div>
                <div className="font-bold text-gray-900">{detail.buyer?.username || detail.seller?.username}</div>
                <div className="text-gray-600">{detail.buyer?.email || detail.seller?.email}</div>
                <div className="text-gray-600">{detail.buyer?.country || detail.seller?.country}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 p-3">
                  <div className="text-xs uppercase text-gray-500">Buyer</div>
                  <div className="font-bold">{detail.buyer ? 'Yes' : 'No'}</div>
                </div>
                <div className="bg-gray-50 p-3">
                  <div className="text-xs uppercase text-gray-500">Seller</div>
                  <div className="font-bold">{detail.seller ? 'Yes' : 'No'}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-50 p-3">
                  <div className="text-xs uppercase text-gray-500">Account status</div>
                  <div className="font-bold">{detail.buyer?.accountStatus || detail.seller?.accountStatus || 'ACTIVE'}</div>
                </div>
                <div className="bg-gray-50 p-3">
                  <div className="text-xs uppercase text-gray-500">Seller status</div>
                  <div className="font-bold">{detail.seller?.sellerStatus || 'ACTIVE'}</div>
                </div>
              </div>
              <div className="border-t border-grey pt-3">
                <div className="mb-2 font-bold text-gray-900">Restriction actions</div>
                <div className="flex flex-wrap gap-2">
                  {(detail.buyer?.accountStatus || detail.seller?.accountStatus) === 'ACCOUNT_LOCKED' ? (
                    <Button className="rounded bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500" label="Unlock account" onClick={() => openStatusAction('account', 'ACTIVE', 'Unlock account')} />
                  ) : (
                    <Button className="rounded bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-500" label="Lock account" onClick={() => openStatusAction('account', 'ACCOUNT_LOCKED', 'Lock account')} />
                  )}
                  {detail.seller && (
                    <>
                      <Button className="rounded bg-amber-600 px-3 py-2 text-xs font-bold text-white hover:bg-amber-500" label="Restrict seller" onClick={() => openStatusAction('seller', 'SELLER_RESTRICTED', 'Restrict seller')} />
                      <Button className="rounded bg-red-700 px-3 py-2 text-xs font-bold text-white hover:bg-red-600" label="Hard lock seller" onClick={() => openStatusAction('seller', 'SELLER_LOCKED_HARD', 'Hard lock seller')} />
                      <Button className="rounded bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-500" label="Restore seller" onClick={() => openStatusAction('seller', 'ACTIVE', 'Restore seller')} />
                    </>
                  )}
                </div>
              </div>
              {detail.seller && (
                <>
                  <div className="border-t border-grey pt-3 font-bold text-gray-900">Seller finance</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-3">Total: {money(detail.summary.totalEarnings)}</div>
                    <div className="bg-gray-50 p-3">Available: {money(detail.summary.availableBalance)}</div>
                    <div className="bg-gray-50 p-3">Pending: {money(detail.summary.pendingWithdrawals)}</div>
                    <div className="bg-gray-50 p-3">Jobs: {detail.summary.completedJobs || 0} done</div>
                  </div>
                </>
              )}
            </div>
          )}
        </aside>
      </div>
      {statusAction && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg bg-white p-5 shadow-xl">
            <h2 className="mb-2 text-lg font-bold text-gray-900">{statusAction.label}</h2>
            {isPreviewFetching && <div className="mb-4 text-sm text-gray-500">Loading preview...</div>}
            {preview && (
              <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
                <div className="bg-gray-50 p-3">Buyer orders: {preview.activeBuyerOrders}</div>
                <div className="bg-gray-50 p-3">Seller orders: {preview.activeSellerOrders}</div>
                <div className="bg-gray-50 p-3">Pending withdrawals: {preview.pendingWithdrawals}</div>
                <div className="bg-gray-50 p-3">Active gigs: {preview.activeGigs}</div>
                <div className="bg-gray-50 p-3">Available: {money(preview.availableBalance)}</div>
                <div className="bg-gray-50 p-3">Current: {statusAction.scope === 'account' ? preview.accountStatus : preview.sellerStatus}</div>
              </div>
            )}
            {preview && statusAction.status === 'ACCOUNT_LOCKED' && (preview.activeBuyerOrders > 0 || preview.activeSellerOrders > 0) && (
              <div className="mb-4 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
                Active orders exist. Seller restriction is recommended when the goal is to stop new marketplace activity without breaking active orders.
              </div>
            )}
            <label className="mb-1 block text-sm font-bold text-gray-700">Reason</label>
            <textarea
              className="mb-4 min-h-[100px] w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-sky-500"
              value={statusReason}
              onChange={(event) => setStatusReason(event.target.value)}
              placeholder="Reason required for audit and user notification"
            />
            <div className="flex justify-end gap-2">
              <Button className="rounded border border-gray-300 px-4 py-2 text-sm font-bold text-gray-700" label="Cancel" onClick={closeStatusAction} />
              <Button
                className="rounded bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-gray-400"
                label={isUpdatingAccount || isUpdatingSeller ? 'Saving...' : 'Confirm'}
                disabled={isUpdatingAccount || isUpdatingSeller}
                onClick={onSubmitStatusAction}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
