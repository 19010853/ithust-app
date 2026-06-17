import { ChangeEvent, FC, ReactElement, useState } from 'react';
import { IExtendedDateModalProps, IExtendedDelivery } from 'src/features/order/interfaces/order.interface';
import { useRequestDeliveryDateExtensionMutation } from 'src/features/order/services/order.service';

import Button from '../button/Button';
import Dropdown from '../dropdown/Dropdown';
import TextAreaInput from '../inputs/TextAreaInput';
import { TimeAgo } from '../utils/timeago.utils';
import { showErrorToast } from '../utils/utils.service';
import ModalBg from './ModalBg';

const ExtendDateModal: FC<IExtendedDateModalProps> = ({ order, onClose }): ReactElement => {
  const [reason, setReason] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('Chọn số ngày');
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [requestDeliveryDateExtension] = useRequestDeliveryDateExtensionMutation();

  const requestExtension = async (): Promise<void> => {
    try {
      const extended: IExtendedDelivery = {
        originalDate: order.offer.oldDeliveryDate,
        newDate: deliveryDate,
        days: parseInt(selectedDay),
        reason
      };
      await requestDeliveryDateExtension({ orderId: order.orderId, body: extended }).unwrap();
      onClose();
    } catch (error) {
      showErrorToast('Không thể gửi yêu cầu.');
    }
  };

  return (
    <ModalBg>
      <div className="fixed bottom-0 left-0 right-0 top-0 z-[30] flex w-full items-center justify-center">
        <div className="relative bottom-auto left-auto right-auto top-auto max-h-[90vh] min-w-[350px] bg-white p-4">
          <div className="w-full text-left">
            <h4 className="mb-3 text-base font-bold">Yêu cầu: Gia hạn ngày giao</h4>
            <div className="alerts alert-warning rounded-none pb-[6px] text-sm font-semibold text-white">
              Gia hạn ngày giao có thể ảnh hưởng đến mức độ hài lòng của người mua.
            </div>
          </div>
          <div className="">
            <div className="mb-5">
              <h4 className="mb-0 text-sm font-bold">Ngày ban đầu</h4>
              <span className="text-[13px]">{TimeAgo.dayMonthYear(order.offer.oldDeliveryDate)}</span>
            </div>
            <div className="relative mb-[66px]">
              <h4 className="mb-[5px] text-sm font-bold">Bạn muốn cộng thêm bao nhiêu ngày?</h4>
              <Dropdown
                text={selectedDay}
                maxHeight="300"
                mainClassNames="absolute bg-white z-40"
                values={['1', '2', '3', '4', '5']}
                setValue={setSelectedDay}
                onClick={(item: string) => {
                  const days: number = parseInt(`${item}`);
                  const currentDate: Date = new Date(order.offer.oldDeliveryDate);
                  currentDate.setDate(currentDate.getDate() + days);
                  setDeliveryDate(`${currentDate}`);
                }}
              />
            </div>
            <div className="mb-5">
              <h4 className="mb-[5px] text-sm font-bold">Giúp người mua hiểu lý do</h4>
              <TextAreaInput
                className="border-grey mb-1 w-full rounded border p-2.5 text-sm font-normal text-gray-600 focus:outline-none"
                name="description"
                placeholder="Nhập lý do gia hạn..."
                value={reason}
                rows={3}
                onChange={(event: ChangeEvent) => setReason((event.target as HTMLTextAreaElement).value)}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              className="rounded bg-gray-200 px-6 py-3 text-center text-sm font-bold text-black focus:outline-none md:px-4 md:py-2 md:text-base"
              label="Hủy"
              onClick={onClose}
            />
            <Button
              disabled={!reason || !deliveryDate}
              className={`cursor-pointer rounded px-6 py-3 text-center text-sm font-bold text-white focus:outline-none md:px-4 md:py-2 md:text-base ${
                !reason || !deliveryDate ? 'cursor-not-allowed bg-sky-200' : 'bg-sky-500 hover:bg-sky-400'
              }`}
              label="Gửi yêu cầu"
              onClick={requestExtension}
            />
          </div>
        </div>
      </div>
    </ModalBg>
  );
};

export default ExtendDateModal;
