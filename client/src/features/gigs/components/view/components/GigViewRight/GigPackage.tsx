import { FC, ReactElement, useContext, useState } from 'react';
import { FaArrowRight, FaRegClock } from 'react-icons/fa';
import { createSearchParams, NavigateFunction, useNavigate } from 'react-router-dom';
import { GigContext } from 'src/features/gigs/context/GigContext';
import { IOffer } from 'src/features/order/interfaces/order.interface';
import Button from 'src/shared/button/Button';
import ApprovalModal from 'src/shared/modals/ApprovalModal';
import { IApprovalModalContent } from 'src/shared/modals/interfaces/modal.interface';
import { formatVnd } from 'src/shared/utils/currency.utils';
import { useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';

const GigPackage: FC = (): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const { gig, seller } = useContext(GigContext);
  const [approvalModalContent, setApprovalModalContent] = useState<IApprovalModalContent>();
  const [showModal, setShowModal] = useState<boolean>(false);
  const navigate: NavigateFunction = useNavigate();
  const gigIsPaused = gig.active === false;
  const isOwnGig =
    `${authUser.username || ''}`.toLowerCase() === `${seller.username || gig.username || ''}`.toLowerCase() ||
    `${authUser.email || ''}`.toLowerCase() === `${seller.email || gig.email || ''}`.toLowerCase();

  const continueToCheck = () => {
    if (gigIsPaused) {
      setApprovalModalContent({
        header: 'Gig đang tạm dừng',
        body: 'Gig này hiện đang tạm dừng và không thể nhận đơn mới.',
        btnText: 'Đã hiểu',
        btnColor: 'bg-sky-500 hover:bg-sky-400'
      });
      setShowModal(true);
      return;
    }
    const deliveryInDays: number = parseInt(gig.expectedDelivery.split(' ')[0]);
    const newDate: Date = new Date();
    newDate.setDate(newDate.getDate() + deliveryInDays);
    const offerParams: IOffer = {
      gigTitle: gig.title,
      description: gig.basicDescription,
      price: gig.price,
      deliveryInDays,
      oldDeliveryDate: `${newDate}`,
      newDeliveryDate: `${newDate}`,
      accepted: false,
      cancelled: false
    };
    navigate(`/gig/checkout/${gig.id}?${createSearchParams({ offer: JSON.stringify(offerParams) })}`, { state: gig });
  };

  return (
    <>
      {showModal && <ApprovalModal approvalModalContent={approvalModalContent} hideCancel={true} onClick={() => setShowModal(false)} />}
      <div className="border-grey mb-8 border">
        <div className="flex border-b px-4 py-2">
          <h4 className="font-bold">{formatVnd(gig.price)}</h4>
        </div>
        <ul className="mb-0 list-none px-4 py-2">
          <li className="flex justify-between">
            <div className="ml-15 flex w-full pb-3">
              <div className="text-base font-bold">{gig.basicTitle}</div>
            </div>
          </li>
          <li className="flex justify-between">
            <div className="ml-15 flex w-full pb-4">
              <div className="text-sm font-normal">{gig.basicDescription}</div>
            </div>
          </li>
          <li className="flex justify-between">
            <div className="ml-15 flex w-full pb-3">
              <FaRegClock className="flex self-center" /> <span className="ml-3 text-sm font-semibold">{gig.expectedDelivery}</span>
            </div>
          </li>
          <li className="flex justify-between">
            <div className="ml-15 flex w-full py-1">
              <Button
                disabled={isOwnGig || gigIsPaused}
                className={`text-md flex w-full justify-between rounded bg-sky-500 px-8 py-2 font-bold text-white focus:outline-none
                ${isOwnGig || gigIsPaused ? 'opacity-20 cursor-not-allowed' : 'hover:bg-sky-400 cursor-pointer'}
                `}
                label={
                  <>
                    <span className="w-full">{gigIsPaused ? 'Đã tạm dừng' : 'Tiếp tục'}</span>
                    <FaArrowRight className="flex self-center" />
                  </>
                }
                onClick={() => {
                  if (authUser && !authUser.emailVerified) {
                    setApprovalModalContent({
                      header: 'Thông báo xác minh email',
                      body: 'Vui lòng xác minh email trước khi tiếp tục.',
                      btnText: 'Đã hiểu',
                      btnColor: 'bg-sky-500 hover:bg-sky-400'
                    });
                    setShowModal(true);
                  } else {
                    continueToCheck();
                  }
                }}
              />
            </div>
          </li>
        </ul>
      </div>
    </>
  );
};

export default GigPackage;
