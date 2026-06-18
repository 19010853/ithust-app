import { PDFDownloadLink } from '@react-pdf/renderer';
import { ChangeEvent, FC, ReactElement, useEffect, useRef, useState } from 'react';
import { NavigateFunction, useNavigate, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { ISellerGig } from 'src/features/gigs/interfaces/gig.interface';
import { useGetGigByIdQuery } from 'src/features/gigs/services/gigs.service';
import Button from 'src/shared/button/Button';
import TextAreaInput from 'src/shared/inputs/TextAreaInput';
import PageMessage from 'src/shared/page-message/PageMessage';
import { IResponse } from 'src/shared/shared.interface';
import { TimeAgo } from 'src/shared/utils/timeago.utils';
import { calculateServiceFeeVnd, formatVnd } from 'src/shared/utils/currency.utils';
import { generateRandomNumber, isFetchBaseQueryError, normalizeOrderStatus, showErrorToast, showSuccessToast } from 'src/shared/utils/utils.service';
import { useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';

import { OrderContext } from '../context/OrderContext';
import { IOffer, IOrderDocument, IOrderInvoice } from '../interfaces/order.interface';
import { useCreateOrderMutation, useLazyGetOrderByOrderIdQuery } from '../services/order.service';
import Invoice from './Invoice/Invoice';

const Requirement: FC = (): ReactElement => {
  const buyer = useAppSelector((state: IReduxState) => state.buyer);
  const [requirement, setRequirement] = useState<string>('');
  const { gigId } = useParams<string>();
  const [searchParams] = useSearchParams({});
  const gigRef = useRef<ISellerGig>();
  const placeholder = 'https://placehold.co/330x220?text=Anh+tam';
  const offer: IOffer = JSON.parse(`${searchParams.get('offer')}`);
  const order_date = `${searchParams.get('order_date')}`;
  const serviceFee: number = calculateServiceFeeVnd(offer.price);
  const navigate: NavigateFunction = useNavigate();
  const orderIdRef = useRef<string>(`JO${generateRandomNumber(11)}`);
  const invoiceIdRef = useRef<string>(`JI${generateRandomNumber(11)}`);
  const orderId = orderIdRef.current;
  const invoiceId = invoiceIdRef.current;
  const { data, isSuccess } = useGetGigByIdQuery(`${gigId}`);
  const [createOrder] = useCreateOrderMutation();
  const [getOrderByOrderId] = useLazyGetOrderByOrderIdQuery();

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'test' | 'live'>('test');
  const [paymentContent, setPaymentContent] = useState<string>('');
  const [paymentWaitExpired, setPaymentWaitExpired] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (isSuccess) {
    gigRef.current = data.gig;
  }

  if (isSuccess && data.gig?.active === false) {
    return <PageMessage header="Gig đã tạm dừng" body="Gig này hiện đang tạm dừng và chưa thể nhận đơn mới." />;
  }

  const isPaidOrder = (order?: IOrderDocument): boolean => normalizeOrderStatus(order?.status || '') === 'in progress';

  const checkPaymentStatus = async (showPendingMessage = true): Promise<void> => {
    try {
      const response: IResponse = await getOrderByOrderId(orderId).unwrap();
      if (isPaidOrder(response.order)) {
        showSuccessToast('Thanh toán đã được xác nhận.');
        navigate(`/orders/${orderId}/activities`, { state: response.order });
        return;
      }
      if (showPendingMessage) {
        showErrorToast('Thanh toán chưa được xác nhận. Vui lòng chờ webhook SePay xử lý.');
      }
    } catch (error) {
      if (showPendingMessage) {
        showErrorToast('Không thể kiểm tra trạng thái thanh toán.');
      }
    }
  };

  useEffect(() => {
    if (!qrCodeUrl) {
      return;
    }
    const interval = window.setInterval(() => {
      checkPaymentStatus(false);
    }, 5000);
    const timeout = window.setTimeout(() => setPaymentWaitExpired(true), 30000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [qrCodeUrl]);

  const orderInvoice: IOrderInvoice = {
    invoiceId,
    orderId,
    date: `${new Date()}`,
    buyerUsername: `${buyer.username}`,
    orderService: [
      {
        service: `${gigRef?.current?.title}`,
        quantity: 1,
        price: offer.price
      },
      {
        service: 'Phí dịch vụ',
        quantity: 1,
        price: serviceFee
      }
    ]
  };

  const startOrder = async (): Promise<void> => {
    try {
      const order: IOrderDocument = {
        offer: {
          gigTitle: offer.gigTitle,
          price: offer.price,
          description: offer.description,
          deliveryInDays: offer.deliveryInDays,
          oldDeliveryDate: offer.oldDeliveryDate,
          newDeliveryDate: offer.newDeliveryDate,
          accepted: true,
          cancelled: offer.cancelled
        },
        gigId: `${gigId}`,
        sellerId: `${gigRef?.current?.sellerId}`,
        sellerImage: `${gigRef?.current?.profilePicture}`,
        sellerUsername: `${gigRef?.current?.username}`,
        sellerEmail: `${gigRef?.current?.email}`,
        gigCoverImage: `${gigRef?.current?.coverImage}`,
        gigMainTitle: `${gigRef?.current?.title}`,
        gigBasicTitle: `${gigRef?.current?.basicTitle}`,
        gigBasicDescription: `${gigRef?.current?.basicDescription}`,
        buyerId: `${buyer._id}`,
        buyerUsername: `${buyer.username}`,
        buyerImage: `${buyer.profilePicture}`,
        buyerEmail: `${buyer.email}`,
        status: 'pending',
        orderId,
        invoiceId,
        quantity: 1,
        dateOrdered: `${new Date()}`,
        price: offer.price,
        requirements: requirement,
        events: {
          placeOrder: order_date,
          requirements: `${new Date()}`,
          orderStarted: `${new Date()}`
        }
      };
      const response: IResponse = await createOrder(order).unwrap();
      
      if (response.payment?.qrCodeUrl) {
        setQrCodeUrl(response.payment.qrCodeUrl);
        setPaymentAmount(response.payment.amount);
        setPaymentMode(response.payment.mode);
        setPaymentContent(response.payment.content);
      } else {
        navigate(`/orders/${orderId}/activities`, { state: response?.order });
      }
    } catch (error) {
      if (isFetchBaseQueryError(error)) {
        showErrorToast(error?.data?.message || 'Không thể bắt đầu đơn hàng của bạn.');
        return;
      }
      showErrorToast('Không thể bắt đầu đơn hàng của bạn.');
    }
  };

  return (
    <div className="container mx-auto lg:h-screen">
      <div className="flex flex-wrap">
        <div className="order-last w-full p-4 lg:order-first lg:w-2/3">
          <div className="mb-4 flex w-full flex-col flex-wrap bg-[#d4edda] p-4">
            <span className="text-base font-bold text-black lg:text-xl">Cảm ơn bạn đã mua dịch vụ</span>
            <div className="flex gap-1">
              Bạn có thể{' '}
              {isMounted && (
                <PDFDownloadLink
                  document={
                    <OrderContext.Provider value={{ orderInvoice }}>
                      <Invoice />
                    </OrderContext.Provider>
                  }
                  fileName={`${orderInvoice.invoiceId}.pdf`}
                >
                  <div className="cursor-pointer text-blue-400 underline">tải hóa đơn</div>
                </PDFDownloadLink>
              )}
            </div>
          </div>
          {qrCodeUrl ? (
            <div className="border-grey border">
              <div className="mb-3 px-4 pb-2 pt-3">
                <span className="mb-3 text-base font-medium text-black md:text-lg lg:text-xl">
                  Quét mã QR để thanh toán
                </span>
                <p className="text-sm">
                  {paymentMode === 'live'
                    ? 'Vui lòng mở ứng dụng ngân hàng và quét mã QR bên dưới để hoàn tất thanh toán cho đơn hàng này.'
                    : 'Đây là chế độ kiểm thử SePay. Hãy tạo giao dịch đến giả lập trên my.sepay.vn với đúng số tiền và nội dung chuyển khoản bên dưới.'}
                </p>
              </div>
              <div className="flex flex-col items-center px-4 pb-4">
                {paymentMode === 'live' && <img src={qrCodeUrl} alt="Mã VietQR" className="mb-4 max-w-xs" />}
                <div className="mb-4 w-full max-w-md rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                  <div className="flex justify-between gap-3">
                    <span>Số tiền</span>
                    <strong>{formatVnd(paymentAmount)}</strong>
                  </div>
                  <div className="mt-2 flex flex-col gap-1">
                    <span>Nội dung chuyển khoản</span>
                    <strong className="break-all">{paymentContent}</strong>
                  </div>
                </div>
                <div className="w-full max-w-md border-t border-gray-200 pt-3 text-sm text-gray-600">
                  Đang chờ SePay xác nhận thanh toán. Trang này sẽ tự động tiếp tục sau khi webhook cập nhật đơn hàng.
                  {paymentWaitExpired && (
                    <p className="mt-2 text-amber-700">
                      Vẫn đang chờ. Hãy kiểm tra log webhook SePay và xác nhận giao dịch kiểm thử dùng đúng số tiền cùng nội dung chuyển khoản ở trên.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="border-grey border">
              <div className="mb-3 px-4 pb-2 pt-3">
                <span className="mb-3 text-base font-medium text-black md:text-lg lg:text-xl">
                  Bạn muốn người bán biết thêm thông tin gì?
                </span>
                <p className="text-sm">Nhấn nút bên dưới để bắt đầu đơn hàng.</p>
              </div>
              <div className="flex flex-col px-4 pb-4">
                <TextAreaInput
                  rows={5}
                  name="requirement"
                  value={requirement}
                  placeholder="Viết mô tả ngắn..."
                  className="border-grey mb-1 w-full rounded border p-3.5 text-sm font-normal text-gray-600 focus:outline-none"
                  onChange={(event: ChangeEvent) => setRequirement((event.target as HTMLTextAreaElement).value)}
                />
                <Button
                  className="mt-3 rounded bg-sky-500 px-6 py-3 text-center text-sm font-bold text-white hover:bg-sky-400 focus:outline-none md:px-4 md:py-2 md:text-base"
                  label="Gửi và thanh toán"
                  onClick={startOrder}
                />
              </div>
            </div>
          )}
        </div>

        <div className="w-full p-4 lg:w-1/3">
          <div className="border-grey mb-8 border">
            <div className="mb-2 flex flex-col border-b md:flex-row">
              <img className="w-full object-cover" src={gigRef.current?.coverImage ?? placeholder} alt="Ảnh bìa gig" />
            </div>
            <ul className="mb-0 list-none">
              <li className="border-grey flex border-b px-4 pb-3 pt-1">
                <div className="text-sm font-normal">{offer.gigTitle}</div>
              </li>
              <li className="flex justify-between px-4 pb-2 pt-4">
                <div className="flex gap-2 text-sm font-normal">Trạng thái</div>
                <span className="rounded bg-orange-300 px-[5px] py-[2px] text-xs font-bold uppercase text-white">Chưa hoàn tất</span>
              </li>
              <li className="flex justify-between px-4 pb-2 pt-2">
                <div className="flex gap-2 text-sm font-normal">Đơn hàng</div>
                <span className="text-sm">#{orderId}</span>
              </li>
              <li className="flex justify-between px-4 pb-2 pt-2">
                <div className="flex gap-2 text-sm font-normal">Ngày đặt</div>
                <span className="text-sm">{TimeAgo.dayMonthYear(`${new Date()}`)}</span>
              </li>
              <li className="flex justify-between px-4 pb-2 pt-2">
                <div className="flex gap-2 text-sm font-normal">Số lượng</div>
                <span className="text-sm">X 1</span>
              </li>
              <li className="flex justify-between px-4 pb-4 pt-2">
                <div className="flex gap-2 text-sm font-normal">Giá</div>
                <span className="text-sm">{formatVnd(offer.price)}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Requirement;
