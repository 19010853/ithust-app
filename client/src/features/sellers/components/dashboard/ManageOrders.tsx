import { findIndex } from 'lodash';
import { FC, ReactElement, useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { IOrderDocument } from 'src/features/order/interfaces/order.interface';
import { orderTypes, sellerOrderList, shortenLargeNumbers } from 'src/shared/utils/utils.service';
import { socket } from 'src/sockets/socket.service';

import { SellerContextType } from '../../interfaces/seller.interface';
import ManageOrdersTable from './components/ManageOrdersTable';

const SELLER_GIG_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  IN_PROGRESS: 'in progress',
  DELIVERED: 'delivered'
};

const ManageOrders: FC = (): ReactElement => {
  const [type, setType] = useState<string>(SELLER_GIG_STATUS.ACTIVE);
  const { orders: contextOrders } = useOutletContext<SellerContextType>();
  const [orders, setOrders] = useState<IOrderDocument[]>([...contextOrders]);

  useEffect(() => {
    setOrders([...contextOrders]);
  }, [contextOrders]);

  useEffect(() => {
    const handleOrderNotification = (order: IOrderDocument) => {
      setOrders((prev) => {
        const index = findIndex(prev, ['orderId', order.orderId]);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = order;
          return updated;
        }
        return [order, ...prev];
      });
    };
    socket.on('order notification', handleOrderNotification);
    return () => {
      socket.off('order notification', handleOrderNotification);
    };
  }, []);

  return (
    <div className="container mx-auto mt-8 px-6 md:px-12 lg:px-6">
      <div className="flex flex-col flex-wrap">
        <div className="mb-8 px-4 text-xl font-semibold text-black md:px-0 md:text-2xl lg:text-4xl">Quản lý đơn hàng</div>
        <div className="p-0">
          <ul className="flex w-full cursor-pointer list-none flex-col flex-wrap rounded-[2px] sm:flex-none sm:flex-row">
            <li className="inline-block py-3 uppercase" onClick={() => setType(SELLER_GIG_STATUS.ACTIVE)}>
              <a
                href="#activeorders"
                className={`px-4 py-3 text-xs text-[#555555] no-underline sm:text-sm md:text-base ${
                  type === SELLER_GIG_STATUS.ACTIVE ? 'pb-[15px] outline outline-1 outline-[#e8e8e8] sm:rounded-t-lg' : ''
                }`}
              >
                Đang hoạt động
                {orderTypes(SELLER_GIG_STATUS.IN_PROGRESS, orders) > 0 && (
                  <span className="ml-1 rounded-[5px] bg-sky-500 px-[5px] py-[1px] text-xs font-medium text-white">
                    {shortenLargeNumbers(orderTypes(SELLER_GIG_STATUS.IN_PROGRESS, orders))}
                  </span>
                )}
              </a>
            </li>
            <li className="inline-block py-3 uppercase" onClick={() => setType(SELLER_GIG_STATUS.COMPLETED)}>
              <a
                href="#activeorders"
                className={`px-4 py-3 text-xs text-[#555555] no-underline sm:text-sm md:text-base ${
                  type === SELLER_GIG_STATUS.COMPLETED ? 'pb-[15px] outline outline-1 outline-[#e8e8e8] sm:rounded-t-lg' : ''
                }`}
              >
                Hoàn thành
                {orderTypes(SELLER_GIG_STATUS.COMPLETED, orders) > 0 && (
                  <span className="ml-1 rounded-[5px] bg-sky-500 px-[5px] py-[1px] text-xs font-medium text-white">
                    {shortenLargeNumbers(orderTypes(SELLER_GIG_STATUS.COMPLETED, orders))}
                  </span>
                )}
              </a>
            </li>
            <li className="inline-block py-3 uppercase" onClick={() => setType(SELLER_GIG_STATUS.CANCELLED)}>
              <a
                href="#activeorders"
                className={`px-4 py-3 text-xs text-[#555555] no-underline sm:text-sm md:text-base ${
                  type === SELLER_GIG_STATUS.CANCELLED ? 'pb-[15px] outline outline-1 outline-[#e8e8e8] sm:rounded-t-lg' : ''
                }`}
              >
                Đã hủy
                {orderTypes(SELLER_GIG_STATUS.CANCELLED, orders) > 0 && (
                  <span className="ml-1 rounded-[5px] bg-sky-500 px-[5px] py-[1px] text-xs font-medium text-white">
                    {shortenLargeNumbers(orderTypes(SELLER_GIG_STATUS.CANCELLED, orders))}
                  </span>
                )}
              </a>
            </li>
          </ul>
        </div>

        {type === SELLER_GIG_STATUS.ACTIVE && (
          <ManageOrdersTable
            type="active"
            orders={sellerOrderList(SELLER_GIG_STATUS.IN_PROGRESS, orders)}
            orderTypes={orderTypes(SELLER_GIG_STATUS.IN_PROGRESS, orders)}
          />
        )}
        {type === SELLER_GIG_STATUS.COMPLETED && (
          <ManageOrdersTable
            type="completed"
            orders={sellerOrderList(SELLER_GIG_STATUS.COMPLETED, orders)}
            orderTypes={orderTypes(SELLER_GIG_STATUS.COMPLETED, orders)}
          />
        )}
        {type === SELLER_GIG_STATUS.CANCELLED && (
          <ManageOrdersTable
            type="cancelled"
            orders={sellerOrderList(SELLER_GIG_STATUS.CANCELLED, orders)}
            orderTypes={orderTypes(SELLER_GIG_STATUS.CANCELLED, orders)}
          />
        )}
      </div>
    </div>
  );
};

export default ManageOrders;
