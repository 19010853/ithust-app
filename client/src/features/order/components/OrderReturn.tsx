import { FC, ReactElement, useEffect, useState } from 'react';
import { Navigate, createSearchParams, useSearchParams } from 'react-router-dom';
import { getDataFromLocalStorage } from 'src/shared/utils/utils.service';

const OrderReturn: FC = (): ReactElement => {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const [gigId, setGigId] = useState<string>('');
  const [offer, setOffer] = useState<any>(null);

  useEffect(() => {
    const savedGigId = getDataFromLocalStorage('zaloPayGigId');
    const savedOffer = getDataFromLocalStorage('zaloPayOffer');
    if (savedGigId) setGigId(savedGigId as string);
    if (savedOffer) setOffer(savedOffer);
  }, []);

  if (!gigId || !offer) {
    return <div>Đang tải...</div>;
  }

  if (status === '1') {
    return (
      <Navigate
        to={`/gig/order/requirement/${gigId}?${createSearchParams({
          offer: JSON.stringify(offer),
          order_date: `${new Date()}`
        })}`}
      />
    );
  }

  // Handle failure
  return (
    <div className="container mx-auto h-screen flex justify-center items-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-red-500 mb-4">Thanh toán thất bại hoặc đã bị hủy</h2>
        <p>Vui lòng thử lại.</p>
        <a href={`/gig/checkout/${gigId}?offer=${JSON.stringify(offer)}`} className="mt-4 text-blue-500 underline">
          Quay lại thanh toán
        </a>
      </div>
    </div>
  );
};

export default OrderReturn;
