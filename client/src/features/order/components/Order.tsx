import { FC, MutableRefObject, ReactElement, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Button from 'src/shared/button/Button';
import { formatVnd } from 'src/shared/utils/currency.utils';
import { TimeAgo } from 'src/shared/utils/timeago.utils';
import { socket, socketService } from 'src/sockets/socket.service';
import { useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';

import { IOrderDocument } from '../interfaces/order.interface';
import { useGetOrderByOrderIdQuery } from '../services/order.service';
import DeliveryTimer from './DeliveryTimer';
import OrderActivities from './order-activities/OrderActivities';
import OrderDetailsTable from './OrderDetailsTable';
import QualityDisputeRequest from './QualityDisputeRequest';

const orderStatusLabel = (status?: string): string => {
  const labels: Record<string, string> = {
    pending: 'Đang chờ',
    'in progress': 'Đang thực hiện',
    delivered: 'Đã giao',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy'
  };
  return labels[`${status}`.toLowerCase()] || `${status || ''}`;
};

const orderDisplayStatus = (order: IOrderDocument): string => (order.paymentStatus === 'REFUND_PROCESSING' ? 'REFUND_PROCESSING' : order.status);

const orderDisplayLabel = (order: IOrderDocument): string => {
  if (order.paymentStatus === 'REFUND_PROCESSING') {
    return 'Đang hoàn tiền';
  }
  if (order.status === 'REFUNDED') {
    return 'Đã hoàn tiền';
  }
  if (order.status === 'DISPUTED') {
    return 'Đang tranh chấp';
  }
  return orderStatusLabel(order.status);
};

const Order: FC = (): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const [showDeliveryPanel, setShowDeliveryPanel] = useState<boolean>(false);
  const [order, setOrder] = useState<IOrderDocument>({} as IOrderDocument);
  const { orderId } = useParams<string>();
  const elementRef: MutableRefObject<HTMLDivElement | null> = useRef(null);
  const { data, isSuccess } = useGetOrderByOrderIdQuery(`${orderId}`);

  useEffect(() => {
    socketService.setupSocketConnection();
    if (isSuccess) {
      setOrder({ ...data.order } as IOrderDocument);
    }
  }, [data?.order, isSuccess]);

  useEffect(() => {
    const handleOrderNotification = (order: IOrderDocument) => {
      if (order.orderId === orderId) {
        setOrder({ ...order });
      }
    };
    socket.on('order notification', handleOrderNotification);
    return () => {
      socket.off('order notification', handleOrderNotification);
    };
  }, [orderId]);

  return (
    <div className="container mx-auto">
      <div className="flex flex-wrap">
        <div className="order-last w-full p-4 lg:order-first lg:w-2/3">
          <OrderDetailsTable order={order} authUser={authUser} />
          {order && order.buyerUsername === authUser.username && <QualityDisputeRequest order={order} username={authUser.username} />}
          {order && order.buyerUsername === authUser.username && order.paymentStatus === 'HELD' && !['DISPUTED', 'REFUNDED'].includes(order.status) && (
            <div className="mt-4 flex flex-col justify-between bg-white md:flex-row">
              <div className="flex w-full flex-col flex-wrap p-4 md:w-2/3">
                <span className="text-base font-bold text-black lg:text-lg">
                  {order.delivered ? 'Đơn giao của bạn đã sẵn sàng!' : 'Đơn hàng của bạn đang được thực hiện'}
                </span>
                {order?.delivered ? (
                  <p className="mt-1 w-5/6 flex-wrap text-sm">
                    Xem phần bàn giao để chắc chắn bạn đã nhận đúng nội dung cần thiết. Hãy cho {order.sellerUsername} biết phản hồi của bạn.
                  </p>
                ) : (
                  <>
                    <p className="mt-1 w-5/6 flex-wrap text-sm">Chúng tôi đã thông báo đơn hàng của bạn cho {order.sellerUsername}.</p>
                    <p className="mt-1 w-5/6 flex-wrap text-sm">
                      Bạn dự kiến sẽ nhận bàn giao trước {TimeAgo.dayMonthYear(order.offer.newDeliveryDate)}
                    </p>
                  </>
                )}
              </div>
              <div className="mb-4 ml-5 w-full justify-center self-center text-left md:mr-3 md:w-1/3 md:text-right">
                {order && order.delivered && order.buyerUsername === authUser.username && (
                  <Button
                    className="rounded bg-sky-500 px-2 py-2 text-center text-sm font-bold text-white hover:bg-sky-400 focus:outline-none md:px-4 md:py-2 md:text-base"
                    label="Xem bàn giao"
                    onClick={() => {
                      if (elementRef.current) {
                        elementRef.current.scrollIntoView({ behavior: 'smooth' });
                      }
                      setShowDeliveryPanel(!showDeliveryPanel);
                    }}
                  />
                )}
              </div>
            </div>
          )}
          {order && Object.keys(order).length > 0 && (
            <OrderActivities ref={elementRef} order={order} authUser={authUser} viewDeliveryBtnClicked={showDeliveryPanel} />
          )}
        </div>

        <div className="w-full p-4 lg:w-1/3 ">
          {Object.keys(order).length > 0 ? (
            <>
              {order.paymentStatus === 'HELD' && order.delivered && authUser.username === order.sellerUsername && <DeliveryTimer order={order} authUser={authUser} />}
              {order.delivered && authUser.username === order.sellerUsername && <></>}
              {order.paymentStatus === 'HELD' && !order.delivered && <DeliveryTimer order={order} authUser={authUser} />}

              <div className="bg-white">
                <div className="mb-2 flex flex-col border-b px-4 pb-4 pt-3 md:flex-row">
                  <img className="h-11 w-20 object-cover" src={order?.gigCoverImage} alt="Ảnh bìa gig" />
                  <div className="flex flex-col">
                    <h4 className="mt-2 text-sm font-bold text-[#161c2d] md:mt-0 md:pl-4">{order.offer.gigTitle}</h4>
                    <span
                      className={`status mt-1 w-24 rounded px-[3px] py-[3px] text-xs font-bold uppercase text-white md:ml-4 ${orderDisplayStatus(order).replace(
                        / /g,
                        ''
                      )}`}
                    >
                      {orderDisplayLabel(order)}
                    </span>
                  </div>
                </div>
                <ul className="mb-0 list-none">
                  <li className="flex justify-between px-4 pb-2 pt-2">
                    <div className="flex gap-2 text-sm font-normal">Đặt từ</div>
                    <span className="text-sm font-bold text-green-500">{order?.sellerUsername}</span>
                  </li>
                  <li className="flex justify-between px-4 pb-2 pt-2">
                    <div className="flex gap-2 text-sm font-normal">Đơn hàng</div>
                    <span className="text-sm font-bold">#{order?.orderId}</span>
                  </li>
                  <li className="flex justify-between px-4 pb-2 pt-2">
                    <div className="flex gap-2 text-sm font-normal">Ngày giao</div>
                    <span className="text-sm font-bold">{TimeAgo.dayMonthYear(order?.offer?.newDeliveryDate)}</span>
                  </li>
                  <li className="flex justify-between px-4 pb-4 pt-2">
                    <div className="flex gap-2 text-sm font-normal">Tổng giá</div>
                    <span className="text-sm font-bold">{formatVnd(order?.price)}</span>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};

export default Order;
