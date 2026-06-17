/* eslint-disable prettier/prettier */
import { FC, ReactElement, useContext, useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import { OrderContext } from 'src/features/order/context/OrderContext';
import { IExtendedDelivery } from 'src/features/order/interfaces/order.interface';
import { useUpdateDeliveryDateMutation } from 'src/features/order/services/order.service';
import Button from 'src/shared/button/Button';
import ApprovalModal from 'src/shared/modals/ApprovalModal';
import { IApprovalModalContent } from 'src/shared/modals/interfaces/modal.interface';
import { TimeAgo } from 'src/shared/utils/timeago.utils';
import { showErrorToast, showSuccessToast } from 'src/shared/utils/utils.service';

const OrderExtension: FC = (): ReactElement => {
  const { order, authUser } = useContext(OrderContext);
  const [approvalModalContent, setApprovalModalContent] = useState<IApprovalModalContent>();
  const [extensionAction, setExtensionAction] = useState<'approve' | 'reject'>('approve');
  const [showExtensionApprovalModal, setShowExtensionApprovalModal] = useState<boolean>(false);
  const [updateDeliveryDate] = useUpdateDeliveryDateMutation();

  const onApproveHandler = async (): Promise<void> => {
    try {
      const extended: IExtendedDelivery = {
        originalDate: `${order?.offer.oldDeliveryDate}`,
        newDate: `${order?.requestExtension?.newDate}`,
        days: parseInt(`${order?.requestExtension?.days}`),
        reason: `${order?.requestExtension?.reason}`,
        deliveryDateUpdate: `${new Date()}`
      };
      await updateDeliveryDate({ orderId: `${order?.orderId}`, type: extensionAction, body: extended });
      setShowExtensionApprovalModal(false);
      showSuccessToast(`${extensionAction === 'approve' ? 'Phê duyệt gia hạn' : 'Từ chối gia hạn'} thành công.`);
    } catch (error) {
      showErrorToast(`Không thể ${extensionAction === 'approve' ? 'phê duyệt' : 'từ chối'} yêu cầu gia hạn.`);
    }
  };

  return (
    <>
      {showExtensionApprovalModal && (
        <ApprovalModal
          approvalModalContent={approvalModalContent}
          hideCancel={false}
          onClose={() => setShowExtensionApprovalModal(false)}
          onClick={onApproveHandler}
        />
      )}
      {order?.requestExtension &&
        order.requestExtension.newDate &&
        TimeAgo.compareDates(order.offer.oldDeliveryDate, order.offer.newDeliveryDate) === 0 && (
          <div className="flex rounded-[4px] bg-white px-4 py-1">
            <div className="w-full">
              <div className="flex gap-4">
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fffdcc]">
                    <FaCheck size={18} color="#e8e123" />
                  </div>
                </div>
                <div className="border-grey w-full cursor-pointer border-b pb-6">
                  <div className="flex items-center justify-between font-medium text-gray-500">
                    <div className="items-left mt-2 flex flex-col gap-2 text-gray-500 md:flex-row md:items-center">
                      {order?.buyerUsername === authUser?.username ? (
                        <span className="text-sm font-bold md:text-base">
                          {order.sellerUsername} đã yêu cầu gia hạn ngày giao
                        </span>
                      ) : (
                        <span className="text-sm font-bold md:text-base">Bạn đã yêu cầu gia hạn ngày giao</span>
                      )}
                    </div>
                  </div>
                  <div className="border-grey mt-4 flex w-full flex-col rounded border">
                    <div className="mt-2">
                      <div className="px-4 py-1 text-left text-sm text-gray-500">
                        <div className="flex flex-col md:grid md:grid-cols-3">
                          <span className="col-span-1 text-sm font-bold">Ngày giao ban đầu</span>
                          <p className="col-span-2 text-sm">{TimeAgo.dayMonthYear(order?.requestExtension.originalDate)}</p>
                        </div>
                        <div className="mt-5 flex flex-col md:grid md:grid-cols-3">
                          <span className="col-span-1 text-sm font-bold">Ngày giao mới</span>
                          <p className="col-span-2 text-sm">{TimeAgo.dayMonthYear(order?.requestExtension.newDate)}</p>
                        </div>
                        <div className="mt-5 flex flex-col md:grid md:grid-cols-3">
                          <span className="col-span-1 text-sm font-bold">Lý do</span>
                          <p className="col-span-2 text-sm">{order?.requestExtension.reason}</p>
                        </div>
                      </div>
                    </div>
                    <div className="border-grey border-b py-1"></div>
                    <div className="flex gap-4 px-3 py-4">
                      {order.buyerUsername === authUser?.username && (
                        <>
                          <Button
                            className="rounded bg-green-500 px-6 py-3 text-center text-sm font-bold text-white hover:bg-green-400 focus:outline-none md:px-4 md:py-2 md:text-base"
                            label="Có, phê duyệt gia hạn"
                            onClick={() => {
                              setExtensionAction('approve');
                              setApprovalModalContent({
                                header: 'Phê duyệt gia hạn',
                                body: 'Bạn có chắc muốn phê duyệt yêu cầu gia hạn này?',
                                btnText: 'Phê duyệt',
                                btnColor: 'bg-sky-500 hover:bg-sky-400'
                              });
                              setShowExtensionApprovalModal(true);
                            }}
                          />
                          <Button
                            className="rounded bg-red-500 px-6 py-3 text-center text-sm font-bold text-white hover:bg-red-400 focus:outline-none md:px-4 md:py-2 md:text-base"
                            label="Không, từ chối gia hạn"
                            onClick={() => {
                              setExtensionAction('reject');
                              setApprovalModalContent({
                                header: 'Từ chối gia hạn',
                                body: 'Bạn có chắc không muốn xem xét lại yêu cầu gia hạn này?',
                                btnText: 'Từ chối',
                                btnColor: 'bg-red-500 hover:bg-red-400'
                              });
                              setShowExtensionApprovalModal(true);
                            }}
                          />
                        </>
                      )}
                      {order.buyerUsername !== authUser?.username && <span>Đang chờ phê duyệt gia hạn.</span>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {order?.offer.reason && (
        <div className="flex rounded-[4px] bg-white px-4 py-1">
          <div className="w-full">
            <div className="flex gap-4">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fffdcc]">
                  <FaCheck size={18} color="#e8e123" />
                </div>
              </div>
              <div className="border-grey w-full cursor-pointer border-b pb-6">
                <div className="flex items-center justify-between font-medium text-gray-500">
                  <div className="items-left mt-2 flex flex-col gap-2 text-gray-500 md:flex-row md:items-center">
                    {order?.buyerUsername !== authUser?.username ? (
                      <span className="text-sm font-bold md:text-base">{order.buyerUsername} đã phê duyệt yêu cầu gia hạn ngày giao</span>
                    ) : (
                      <span className="text-sm font-bold md:text-base">Bạn đã phê duyệt yêu cầu gia hạn ngày giao</span>
                    )}
                    <p className="text-sm font-normal italic">{TimeAgo.dayWithTime(`${order?.events.deliveryDateUpdate}`)}</p>
                  </div>
                </div>
                <div className="border-grey mt-4 flex w-full flex-col rounded border">
                  <div className="mt-2">
                    <div className="px-4 py-1 text-left text-sm text-gray-500">
                      <div className="flex flex-col md:grid md:grid-cols-3">
                        <span className="col-span-1 text-sm font-bold">Ngày giao ban đầu</span>
                        <p className="col-span-2 text-sm">{TimeAgo.dayMonthYear(`${order?.offer.oldDeliveryDate}`)}</p>
                      </div>
                      <div className="mt-5 flex flex-col md:grid md:grid-cols-3">
                        <span className="col-span-1 text-sm font-bold">Ngày giao mới</span>
                        <p className="col-span-2 text-sm">{TimeAgo.dayMonthYear(`${order?.offer.newDeliveryDate}`)}</p>
                      </div>
                      <div className="mt-5 flex flex-col md:grid md:grid-cols-3">
                        <span className="col-span-1 text-sm font-bold">Lý do</span>
                        <p className="col-span-2 text-sm">{order?.offer.reason}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderExtension;
