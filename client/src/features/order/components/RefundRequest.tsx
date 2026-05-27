import { ChangeEvent, FC, ReactElement, useState } from 'react';
import Button from 'src/shared/button/Button';
import TextAreaInput from 'src/shared/inputs/TextAreaInput';
import TextInput from 'src/shared/inputs/TextInput';
import { showErrorToast, showSuccessToast } from 'src/shared/utils/utils.service';

import { IOrderDocument, IRefundRequestPayload } from '../interfaces/order.interface';
import { useCreateRefundRequestMutation } from '../services/order.service';

const emptyRefund: IRefundRequestPayload = {
  reason: '',
  bankInfo: {
    bankName: '',
    accountNumber: '',
    accountName: ''
  }
};

const inputClass = 'border-grey w-full rounded border p-3 text-sm text-gray-700 focus:outline-none';

const RefundRequest: FC<{ order: IOrderDocument }> = ({ order }): ReactElement | null => {
  const [refund, setRefund] = useState<IRefundRequestPayload>(emptyRefund);
  const [open, setOpen] = useState<boolean>(false);
  const [createRefundRequest, { isLoading }] = useCreateRefundRequestMutation();

  if (order.paymentStatus !== 'HELD' || order.approved) {
    return null;
  }

  const updateBankInfo = (event: ChangeEvent): void => {
    const target = event.target as HTMLInputElement;
    setRefund({ ...refund, bankInfo: { ...refund.bankInfo, [target.name]: target.value } });
  };

  const submitRefund = async (): Promise<void> => {
    try {
      await createRefundRequest({ orderId: order.orderId, body: refund }).unwrap();
      setOpen(false);
      showSuccessToast('Refund request sent for review.');
    } catch (error) {
      showErrorToast('Unable to create refund request.');
    }
  };

  return (
    <div className="mt-4 border-grey border bg-white p-4">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h3 className="text-base font-bold text-black">Payment held by platform</h3>
          <p className="text-sm text-gray-600">Request a manual refund review when the seller cannot deliver or the order needs support.</p>
        </div>
        <Button
          className="rounded bg-red-500 px-4 py-2 text-sm font-bold text-white hover:bg-red-400"
          label={open ? 'Close refund form' : 'Request refund'}
          onClick={() => setOpen(!open)}
        />
      </div>
      {open && (
        <div className="mt-4 grid gap-3">
          <TextAreaInput
            name="reason"
            rows={4}
            value={refund.reason}
            placeholder="Reason for refund request"
            className={inputClass}
            onChange={(event: ChangeEvent) => setRefund({ ...refund, reason: (event.target as HTMLTextAreaElement).value })}
          />
          <div className="grid gap-3 md:grid-cols-3">
            <TextInput name="bankName" value={refund.bankInfo.bankName} placeholder="Bank name" className={inputClass} onChange={updateBankInfo} />
            <TextInput
              name="accountNumber"
              value={refund.bankInfo.accountNumber}
              placeholder="Account number"
              className={inputClass}
              onChange={updateBankInfo}
            />
            <TextInput
              name="accountName"
              value={refund.bankInfo.accountName}
              placeholder="Account name"
              className={inputClass}
              onChange={updateBankInfo}
            />
          </div>
          <Button
            className="w-fit rounded bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-400 disabled:opacity-60"
            label={isLoading ? 'Submitting...' : 'Submit refund request'}
            disabled={
              isLoading ||
              refund.reason.trim().length < 10 ||
              !refund.bankInfo.bankName.trim() ||
              !refund.bankInfo.accountNumber.trim() ||
              !refund.bankInfo.accountName.trim()
            }
            onClick={submitRefund}
          />
        </div>
      )}
    </div>
  );
};

export default RefundRequest;
