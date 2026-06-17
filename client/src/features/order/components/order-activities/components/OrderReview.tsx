import { FC, ReactElement, useContext, useState } from 'react';
import { FaChevronDown, FaChevronUp, FaRegStar } from 'react-icons/fa';
import { OrderContext } from 'src/features/order/context/OrderContext';
import { IOrderReviewModal } from 'src/features/order/interfaces/order.interface';
import Button from 'src/shared/button/Button';
import ReviewModal from 'src/shared/modals/ReviewModal';
import StarRating from 'src/shared/rating/StarRating';
import { TimeAgo } from 'src/shared/utils/timeago.utils';

const OrderReview: FC = (): ReactElement => {
  const { order, authUser } = useContext(OrderContext);
  const [orderReviewModal, setOrderReviewModal] = useState<IOrderReviewModal>({
    buyerReview: false,
    sellerReview: false,
    buyerPanel: false,
    sellerPanel: false
  });

  return (
    <>
      {orderReviewModal.buyerReview && (
        <ReviewModal type="buyer-review" order={order} onClose={() => setOrderReviewModal({ ...orderReviewModal, buyerReview: false })} />
      )}
      {orderReviewModal.sellerReview && (
        <ReviewModal type="seller-review" order={order} onClose={() => setOrderReviewModal({ ...orderReviewModal, sellerReview: false })} />
      )}
      {order?.approved && authUser?.username === order.buyerUsername && order.buyerReview?.rating === 0 && (
        <div className="flex rounded-[4px] bg-white px-4 py-3">
          <div className="w-full">
            <div className="flex gap-4">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eb8c34]">
                  <FaRegStar size={18} color="#fcd5b1" />
                </div>
              </div>
              <div className="w-full cursor-pointer pb-6">
                <div className="mt-2 flex items-center justify-between font-medium text-gray-500">
                  <span>Bạn đã sẵn sàng đánh giá người bán?</span>
                </div>
                <div className="my-3 flex">
                  <Button
                    onClick={() => setOrderReviewModal({ ...orderReviewModal, buyerReview: true })}
                    className="rounded bg-green-500 px-6 py-3 text-center text-sm font-bold text-white hover:bg-green-400 focus:outline-none md:px-4 md:py-2 md:text-base"
                    label="Viết đánh giá"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {order?.approved && order?.buyerReview && order?.buyerReview?.rating > 0 && (
        <div className="flex rounded-[4px] bg-white px-4 py-3">
          <div className="w-full">
            <div className="flex gap-4">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ededed]">
                  <FaRegStar size={18} color="#6d6d6e" />
                </div>
              </div>
              <div className="border-grey w-full cursor-pointer border-b pb-6">
                <div className="mt-2 flex items-center justify-between font-medium text-gray-500">
                  <div className="flex gap-2">
                    {authUser?.username === order.buyerUsername && <span>Bạn đã để lại đánh giá {order.buyerReview?.rating} sao</span>}
                    {authUser?.username === order.sellerUsername && (
                      <span>
                        {order.buyerUsername} đã đánh giá bạn {order.buyerReview?.rating} sao
                      </span>
                    )}
                    <p className="flex self-center text-sm font-normal italic">{TimeAgo.dayWithTime(`${order?.events.buyerReview}`)}</p>
                  </div>
                  <div onClick={() => setOrderReviewModal({ ...orderReviewModal, buyerPanel: !orderReviewModal.buyerPanel })}>
                    {!orderReviewModal.buyerPanel ? <FaChevronDown size={15} /> : <FaChevronUp size={15} />}
                  </div>
                </div>
                {orderReviewModal.buyerPanel && (
                  <div className="my-3 flex flex-col">
                    <div className="relative overflow-x-auto">
                      <div className="border-grey w-full rounded border text-left text-sm text-gray-500">
                        <div className="border-grey border-b bg-[#fafafb] py-3 font-medium uppercase">
                          <span className="px-5">
                            {authUser?.username === order.buyerUsername ? 'Đánh giá của bạn' : `Đánh giá của ${order.buyerUsername}`}
                          </span>
                        </div>
                        <div className="flex w-full cursor-pointer flex-col items-center space-x-4 px-5 py-4 md:flex-row">
                          <div className="flex w-full justify-center md:w-12 md:self-start">
                            <img className="h-10 w-10 rounded-full object-cover" src={order.buyerImage} alt="Ảnh người mua" />
                          </div>
                          <div className="w-full text-sm dark:text-white">
                            <div className="flex justify-between text-sm font-bold text-[#777d74] md:text-base">
                              <div className="flex flex-row gap-2">
                                {authUser?.username === order.buyerUsername ? 'Tôi' : order.buyerUsername}
                                <div className="flex self-center">
                                  <div className="flex flex-row items-center gap-x-1">
                                    <StarRating value={order.buyerReview?.rating} size={14} />
                                  </div>
                                  <div className="ml-1 flex gap-1 text-sm">
                                    <span className="text-orange-400">({order.buyerReview?.rating})</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-1 flex flex-col justify-between text-[#777d74]">
                              <span className="text-sm md:text-[15px]">{order.buyerReview?.review}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {order?.approved &&
        authUser?.username === order.sellerUsername &&
        order?.sellerReview?.rating === 0 &&
        order?.buyerReview &&
        order?.buyerReview?.rating > 0 && (
          <div className="flex rounded-[4px] bg-white px-4 py-3">
            <div className="w-full">
              <div className="flex gap-4">
                <div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eb8c34]">
                    <FaRegStar size={18} color="#fcd5b1" />
                  </div>
                </div>
                <div className="w-full cursor-pointer pb-6">
                  <div className="mt-2 flex items-center justify-between font-medium text-gray-500">
                    <span>Bạn đã sẵn sàng đánh giá người mua?</span>
                  </div>
                  <div className="my-3 flex">
                    <Button
                      onClick={() => setOrderReviewModal({ ...orderReviewModal, sellerReview: true })}
                      className="rounded bg-green-500 px-6 py-3 text-center text-sm font-bold text-white hover:bg-green-400 focus:outline-none md:px-4 md:py-2 md:text-base"
                      label="Viết đánh giá"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {order?.approved && order?.sellerReview && order?.sellerReview?.rating > 0 && (
        <div className="flex rounded-[4px] bg-white px-4 py-3">
          <div className="w-full">
            <div className="flex gap-4">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ededed]">
                  <FaRegStar size={18} color="#6d6d6e" />
                </div>
              </div>
              <div className="w-full cursor-pointer pb-6">
                <div className="mt-2 flex items-center justify-between font-medium text-gray-500">
                  <div className="flex gap-2">
                    {authUser?.username === order.sellerUsername && (
                      <span>
                        Bạn đã đánh giá {order.buyerUsername} {order.sellerReview?.rating} sao
                      </span>
                    )}
                    {authUser?.username === order.buyerUsername && (
                      <span>
                        {order.sellerUsername} đã đánh giá bạn {order.sellerReview?.rating} sao
                      </span>
                    )}
                    <p className="flex self-center text-sm font-normal italic">{TimeAgo.dayWithTime(`${order?.events.sellerReview}`)}</p>
                  </div>
                  <div onClick={() => setOrderReviewModal({ ...orderReviewModal, sellerPanel: !orderReviewModal.sellerPanel })}>
                    {!orderReviewModal.sellerPanel ? <FaChevronDown size={15} /> : <FaChevronUp size={15} />}
                  </div>
                </div>
                {orderReviewModal.sellerPanel && (
                  <div className="my-3 flex flex-col">
                    <div className="relative overflow-x-auto">
                      <div className="border-grey w-full rounded border text-left text-sm text-gray-500">
                        <div className="border-grey border-b bg-[#fafafb] py-3 font-medium uppercase">
                          <span className="px-5">
                            {authUser?.username === order.sellerUsername ? 'Đánh giá của bạn' : `Đánh giá của ${order.sellerUsername}`}
                          </span>
                        </div>
                        <div className="flex w-full cursor-pointer flex-col items-center space-x-4 px-5 py-4 md:flex-row">
                          <div className="flex w-full justify-center md:w-12 md:self-start">
                            <img className="h-10 w-10 rounded-full object-cover" src={order.sellerImage} alt="Ảnh người bán" />
                          </div>
                          <div className="w-full text-sm dark:text-white">
                            <div className="flex justify-between text-sm font-bold text-[#777d74] md:text-base">
                              <div className="flex flex-row gap-2">
                                {authUser?.username === order.sellerUsername ? 'Tôi' : order.sellerUsername}
                                <div className="flex self-center">
                                  <div className="flex flex-row items-center gap-x-1">
                                    <StarRating value={order.sellerReview.rating} size={14} />
                                  </div>
                                  <div className="ml-1 flex gap-1 text-sm">
                                    <span className="text-orange-400">({order.sellerReview?.rating})</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="mt-1 flex flex-col justify-between text-[#777d74]">
                              <span className="text-sm md:text-[15px]">{order.sellerReview?.review}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default OrderReview;
