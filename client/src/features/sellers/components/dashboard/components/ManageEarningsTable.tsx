import { FC, ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { IOrderDocument, IOrderTableProps } from 'src/features/order/interfaces/order.interface';
import { updateHeader } from 'src/shared/header/reducers/header.reducer';
import { calculateSellerEarningsVnd, formatVnd } from 'src/shared/utils/currency.utils';
import { TimeAgo } from 'src/shared/utils/timeago.utils';
import { useAppDispatch } from 'src/store/store';
import { v4 as uuidv4 } from 'uuid';

const ManageEarningsTable: FC<IOrderTableProps> = ({ type, orders, orderTypes }): ReactElement => {
  const dispatch = useAppDispatch();

  return (
    <div className="flex flex-col justify-between">
      <div className="border-grey border border-b-0 px-3 py-3">
        <div className="font-bold uppercase text-xs sm:text-sm md:text-base">Thanh toán </div>
      </div>
      <table className="border border-grey w-full table-auto flex flex-row flex-no-wrap text-sm text-gray-500 overflow-hidden sm:inline-table">
        {orderTypes > 0 ? (
          <>
            <thead className="border-grey border-b text-xs uppercase text-gray-700 sm:[&>*:not(:first-child)]:hidden">
              {orders.map(() => (
                <tr
                  key={uuidv4()}
                  className="bg-sky-500 text-white flex flex-col flex-nowrap sm:table-row md:table-row mb-1 sm:mb-0 lg:bg-transparent lg:text-black "
                >
                  <th className="p-3 text-left md:text-center">Ngày</th>
                  <th className="p-3 text-left md:text-center">Hoạt động</th>
                  <th className="p-3 text-left md:text-center">Mô tả</th>
                  <th className="p-3 text-left md:text-center">Từ</th>
                  <th className="p-3 text-left md:text-center">Đơn hàng</th>
                  <th className="p-3 text-left md:text-center">Số tiền</th>
                </tr>
              ))}
            </thead>
            <tbody className="flex-1 sm:flex-none">
              {orders.map((order: IOrderDocument) => (
                <tr key={uuidv4()} className="bg-white border-b border-grey flex flex-col flex-nowrap sm:table-row mb-2 sm:mb-0 ">
                  <td className="p-3 text-left md:text-center">{TimeAgo.dayMonthYear(`${order.events.orderDelivered}`)}</td>
                  <td className="p-3 text-left md:text-center">Doanh thu</td>
                  <td className="p-3 text-left md:text-center">đơn hàng</td>
                  <td className="p-3 text-left md:text-center lowercase">{order.buyerUsername}</td>
                  <td className="p-3 text-left md:text-center">
                    <Link onClick={() => dispatch(updateHeader('home'))} to={`/orders/${order.orderId}/activities`} className="underline">
                      {order.orderId}
                    </Link>
                  </td>
                  <td className="px-3 text-left md:text-center text-sky-500 font-bold">{formatVnd(calculateSellerEarningsVnd(order.price))}</td>
                </tr>
              ))}
            </tbody>
          </>
        ) : (
          <tbody>
            <tr>
              <td className="w-full px-4 py-2 text-sm">Không có đơn hàng {type === 'active' ? 'đang hoạt động' : type} để hiển thị.</td>
            </tr>
          </tbody>
        )}
      </table>
    </div>
  );
};

export default ManageEarningsTable;
