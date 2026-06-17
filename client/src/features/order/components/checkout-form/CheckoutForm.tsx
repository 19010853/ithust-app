import { FC, FormEvent, ReactElement, useState } from 'react';
import { createSearchParams, useNavigate } from 'react-router-dom';
import Button from 'src/shared/button/Button';

import { ICheckoutProps } from '../../interfaces/order.interface';

const CheckoutForm: FC<ICheckoutProps> = ({ gigId, offer }): ReactElement => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    setIsLoading(true);
    
    // Simulate a small delay for better UX
    setTimeout(() => {
      navigate(`/gig/order/requirement/${gigId}?${createSearchParams({
        offer: JSON.stringify(offer),
        order_date: `${new Date()}`
      })}`);
    }, 500);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className="px-4 py-2">
      <div className="mb-6 text-sm text-gray-600">
        Bạn sắp đặt đơn hàng. Nhấn nút bên dưới để chuyển sang trang yêu cầu, nơi bạn gửi hướng dẫn cho người bán và nhận mã QR thanh toán.
      </div>
      <Button
        id="submit"
        className={`w-full rounded px-6 py-3 text-center text-sm font-bold text-white focus:outline-none md:px-4 md:py-2 md:text-base ${
          isLoading ? 'cursor-not-allowed bg-sky-200' : 'bg-sky-500 hover:bg-sky-400'
        }`}
        label={<span id="button-text">{isLoading ? <div className="spinner" id="spinner"></div> : 'Xác nhận và tiếp tục'}</span>}
      />
    </form>
  );
};

export default CheckoutForm;
