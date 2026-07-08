import { PDFDownloadLink } from '@react-pdf/renderer';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { ChangeEvent, FC, ReactElement, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { addBuyer } from 'src/features/buyer/reducers/buyer.reducer';
import { useGetCurrentBuyerByUsernameQuery } from 'src/features/buyer/services/buyer.service';
import { ISellerGig } from 'src/features/gigs/interfaces/gig.interface';
import { useGetGigByIdQuery } from 'src/features/gigs/services/gigs.service';
import Button from 'src/shared/button/Button';
import TextAreaInput from 'src/shared/inputs/TextAreaInput';
import PageMessage from 'src/shared/page-message/PageMessage';
import { IResponse } from 'src/shared/shared.interface';
import { calculateServiceFeeVnd, formatVnd } from 'src/shared/utils/currency.utils';
import { translateApiErrorMessage } from 'src/shared/utils/api-error-messages';
import { TimeAgo } from 'src/shared/utils/timeago.utils';
import { generateRandomNumber, isFetchBaseQueryError, showErrorToast } from 'src/shared/utils/utils.service';
import { useAppDispatch, useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';

import { OrderContext } from '../context/OrderContext';
import { IOffer, IOrderDocument, IOrderInvoice } from '../interfaces/order.interface';
import { useCreateOrderMutation } from '../services/order.service';
import Invoice from './Invoice/Invoice';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

const isBlank = (value?: string | null): boolean => !value || value === 'undefined' || value === 'null';

const StripePaymentForm: FC<{ orderId: string }> = ({ orderId }): ReactElement => {
  const stripe = useStripe();
  const elements = useElements();
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const submitPayment = async (): Promise<void> => {
    if (!stripe || !elements) {
      return;
    }
    setIsSubmitting(true);
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/orders/${orderId}/activities`
      }
    });
    if (result.error) {
      showErrorToast(result.error.message || 'Không thể xác nhận thanh toán Stripe.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded border border-sky-200 bg-white p-4">
      <div className="mb-3 rounded bg-yellow-50 px-3 py-2 text-sm text-yellow-800">Stripe Sandbox - không sử dụng tiền thật.</div>
      <PaymentElement />
      <Button
        className="mt-4 rounded bg-sky-500 px-5 py-2 text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        disabled={!stripe || !elements || isSubmitting}
        label={isSubmitting ? 'Đang xác nhận...' : 'Thanh toán bằng Stripe Sandbox'}
        onClick={submitPayment}
      />
    </div>
  );
};

const Requirement: FC = (): ReactElement => {
  const buyer = useAppSelector((state: IReduxState) => state.buyer);
  const dispatch = useAppDispatch();
  const [requirement, setRequirement] = useState<string>('');
  const { gigId } = useParams<string>();
  const [searchParams] = useSearchParams({});
  const gigRef = useRef<ISellerGig>();
  const placeholder = 'https://placehold.co/330x220?text=Anh+tam';
  const offer: IOffer = JSON.parse(`${searchParams.get('offer')}`);
  const order_date = `${searchParams.get('order_date')}`;
  const serviceFee: number = calculateServiceFeeVnd(offer.price);
  const orderIdRef = useRef<string>(`JO${generateRandomNumber(11)}`);
  const invoiceIdRef = useRef<string>(`JI${generateRandomNumber(11)}`);
  const orderId = orderIdRef.current;
  const invoiceId = invoiceIdRef.current;
  const { data, isSuccess } = useGetGigByIdQuery(`${gigId}`);
  const { data: buyerData } = useGetCurrentBuyerByUsernameQuery();
  const [createOrder, { isLoading: isCreatingOrder }] = useCreateOrderMutation();
  const fetchedBuyer = buyerData?.buyer;
  const activeBuyer = !isBlank(buyer?._id) ? buyer : fetchedBuyer;

  const [stripeClientSecret, setStripeClientSecret] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (fetchedBuyer?._id) {
      dispatch(addBuyer(fetchedBuyer));
    }
  }, [dispatch, fetchedBuyer]);

  if (isSuccess) {
    gigRef.current = data.gig;
  }

  if (isSuccess && data.gig?.active === false) {
    return <PageMessage header="Gig đã tạm dừng" body="Gig này hiện đang tạm dừng và chưa thể nhận đơn mới." />;
  }

  const buyerReady =
    !isBlank(activeBuyer?._id) && !isBlank(activeBuyer?.username) && !isBlank(activeBuyer?.email) && !isBlank(activeBuyer?.profilePicture);
  const gigReady =
    !isBlank(gigId) &&
    !isBlank(gigRef.current?.sellerId) &&
    !isBlank(gigRef.current?.username) &&
    !isBlank(gigRef.current?.email) &&
    !isBlank(gigRef.current?.coverImage);
  const canStartOrder = buyerReady && gigReady && !isCreatingOrder;

  const orderInvoice: IOrderInvoice = {
    invoiceId,
    orderId,
    date: `${new Date()}`,
    buyerUsername: activeBuyer?.username || '',
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
    const buyerForOrder = activeBuyer;
    if (!buyerReady || !buyerForOrder) {
      showErrorToast('Không thể lấy thông tin người mua. Vui lòng đăng nhập lại hoặc kiểm tra Users service.');
      return;
    }

    if (!gigReady) {
      showErrorToast('Không thể lấy thông tin gig hoặc người bán. Vui lòng tải lại trang sau khi Users service hoạt động.');
      return;
    }

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
        sellerId: `${gigRef.current?.sellerId}`,
        sellerImage: `${gigRef.current?.profilePicture}`,
        sellerUsername: `${gigRef.current?.username}`,
        sellerEmail: `${gigRef.current?.email}`,
        gigCoverImage: `${gigRef.current?.coverImage}`,
        gigMainTitle: `${gigRef.current?.title}`,
        gigBasicTitle: `${gigRef.current?.basicTitle}`,
        gigBasicDescription: `${gigRef.current?.basicDescription}`,
        buyerId: `${buyerForOrder._id}`,
        buyerUsername: `${buyerForOrder.username}`,
        buyerImage: `${buyerForOrder.profilePicture}`,
        buyerEmail: `${buyerForOrder.email}`,
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

      if (response.payment?.clientSecret) {
        setStripeClientSecret(response.payment.clientSecret);
        setPaymentAmount(response.payment.amount);
      } else {
        showErrorToast('Stripe không trả về thông tin thanh toán.');
      }
    } catch (error) {
      if (isFetchBaseQueryError(error)) {
        showErrorToast(translateApiErrorMessage(error?.data?.message) || 'Không thể bắt đầu đơn hàng của bạn.');
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
          {stripeClientSecret ? (
            <div className="border-grey border">
              <div className="mb-3 px-4 pb-2 pt-3">
                <span className="mb-3 text-base font-medium text-black md:text-lg lg:text-xl">Thanh toán bằng Stripe</span>
                <p className="text-sm">Nhập thông tin thanh toán trong biểu mẫu Stripe bên dưới để hoàn tất đơn hàng này.</p>
              </div>
              <div className="flex flex-col items-center px-4 pb-4">
                <div className="mb-4 w-full max-w-md rounded border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                  <div className="flex justify-between gap-3">
                    <span>Số tiền cần thanh toán</span>
                    <strong>{formatVnd(paymentAmount)}</strong>
                  </div>
                </div>
                <div className="w-full max-w-md border-t border-gray-200 pt-3 text-sm text-gray-600">
                  Sau khi Stripe xác nhận thanh toán, bạn sẽ được chuyển đến trang hoạt động của đơn hàng.
                </div>
                <div className="mt-4 w-full max-w-md">
                  <Elements stripe={stripePromise} options={{ clientSecret: stripeClientSecret }}>
                    <StripePaymentForm orderId={orderId} />
                  </Elements>
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
                {!buyerReady && (
                  <p className="mt-2 text-sm text-red-600">
                    Chưa tải được thông tin người mua. Hãy kiểm tra Users service rồi tải lại trang.
                  </p>
                )}
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
                  className="mt-3 rounded bg-sky-500 px-6 py-3 text-center text-sm font-bold text-white hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-gray-300 focus:outline-none md:px-4 md:py-2 md:text-base"
                  disabled={!canStartOrder}
                  label={isCreatingOrder ? 'Đang tạo thanh toán...' : 'Gửi và thanh toán'}
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
