import { FC, ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { IOrderDocument, IOrderTableProps } from 'src/features/order/interfaces/order.interface';
import { TimeAgo } from 'src/shared/utils/timeago.utils';
import { normalizeOrderStatus } from 'src/shared/utils/utils.service';
import { v4 as uuidv4 } from 'uuid';

const orderTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    active: 'đang hoạt động',
    completed: 'đã hoàn tất',
    cancelled: 'đã hủy'
  };
  return labels[type] || type;
};

const orderStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    approved: 'Đã duyệt',
    cancelled: 'Đã hủy',
    completed: 'Đã hoàn tất',
    delivered: 'Đã giao',
    'in progress': 'Đang thực hiện',
    pending: 'Chờ xử lý',
    placed: 'Đã đặt',
    revision: 'Yêu cầu chỉnh sửa'
  };
  const normalizedStatus = normalizeOrderStatus(status);
  return labels[normalizedStatus] || status;
};

const BuyerTable: FC<IOrderTableProps> = ({ type, orders, orderTypes }): ReactElement => {
  return (
    <div className="flex flex-col">
      <div className="border-grey border border-b-0 px-3 py-3">
        <div className="text-xs font-bold uppercase sm:text-sm md:text-base">Đơn hàng {orderTypeLabel(type)} </div>
      </div>
      <table className="border-grey flex-no-wrap flex w-full table-auto flex-row overflow-hidden border text-sm text-gray-500 sm:inline-table">
        {orderTypes > 0 ? (
          <>
            <thead className="border-grey border-b text-xs uppercase text-gray-700 sm:[&>*:not(:first-child)]:hidden">
              {orders.map(() => (
                <tr
                  key={uuidv4()}
                  className="mb-1 flex flex-col flex-nowrap bg-sky-500 text-white sm:mb-0 sm:table-row md:table-row lg:bg-transparent lg:text-black"
                >
                  <th className="p-3 text-center md:w-[6%]">
                    <span className="block lg:hidden">Ảnh</span>
                  </th>
                  <th className="p-3 text-center md:w-[40%]">
                    <span className="block lg:hidden">Tiêu đề</span>
                  </th>
                  <th className="p-3 text-center">Ngày đặt</th>
                  <th className="p-3 text-center">{type === 'cancelled' ? 'Ngày hủy' : 'Hạn giao'}</th>
                  <th className="p-3 text-center">Tổng</th>
                  <th className="p-3 text-center">Trạng thái</th>
                </tr>
              ))}
            </thead>
            <tbody className="flex-1 sm:flex-none">
              {orders.map((order: IOrderDocument) => (
                <tr key={uuidv4()} className="border-grey mb-2 flex flex-col flex-nowrap border-b bg-white sm:mb-0 sm:table-row ">
                  <td className="px-3 py-3 lg:flex lg:justify-center">
                    <img className="h-6 w-10 object-cover lg:h-8 lg:w-11" src={order.gigCoverImage} alt="Ảnh bìa gig" />
                  </td>
                  <td className="p-3 text-left">
                    <div className="grid">
                      <Link to={`/orders/${order.orderId}/activities`} className="truncate text-sm font-normal hover:text-sky-500">
                        {order.gigBasicTitle}
                      </Link>
                    </div>
                  </td>
                  <td className="p-3 text-left lg:text-center">{TimeAgo.dayMonthYear(`${order.dateOrdered}`)}</td>
                  <td className="p-3 text-left lg:text-center">
                    {type === 'cancelled'
                      ? TimeAgo.dayMonthYear(`${order.approvedAt}`)
                      : TimeAgo.dayMonthYear(`${order.offer.newDeliveryDate}`)}
                  </td>
                  <td className="p-3 text-left lg:text-center">${order.price}</td>
                  <td className="px-3 py-1 text-left lg:p-3 lg:text-center">
                    <span
                      className={`status rounded bg-transparent p-0 text-xs font-bold uppercase text-black sm:px-[5px] sm:py-[4px] sm:text-white ${normalizeOrderStatus(
                        order.status
                      ).replace(/ /g, '')}`}
                    >
                      {orderStatusLabel(order.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </>
        ) : (
          <tbody>
            <tr>
              <td className="w-full px-4 py-2 text-sm">Không có đơn hàng {orderTypeLabel(type)} để hiển thị.</td>
            </tr>
          </tbody>
        )}
      </table>
    </div>
  );
};

export default BuyerTable;
