import { FC, ReactElement, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageMessage from 'src/shared/page-message/PageMessage';
import { showErrorToast, showSuccessToast } from 'src/shared/utils/utils.service';
import { useCapturePayPalOrderMutation } from '../services/order.service';

const PayPalReturn: FC = (): ReactElement => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [capture] = useCapturePayPalOrderMutation();
  const started = useRef(false);
  const [message, setMessage] = useState('Đang xác nhận thanh toán PayPal...');
  const localOrderId = searchParams.get('localOrderId') || '';

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (!localOrderId) {
      setMessage('Thiếu mã đơn hàng PayPal.');
      return;
    }
    capture(localOrderId)
      .unwrap()
      .then((response) => {
        showSuccessToast('Thanh toán PayPal đã được xác nhận.');
        navigate(`/orders/${localOrderId}/activities`, { replace: true, state: response.order });
      })
      .catch(() => {
        setMessage('Không thể xác nhận thanh toán PayPal. Vui lòng kiểm tra lại lịch sử đơn hàng.');
        showErrorToast('Không thể xác nhận thanh toán PayPal.');
      });
  }, [capture, localOrderId, navigate]);

  return <PageMessage header="Thanh toán PayPal" body={message} />;
};

export default PayPalReturn;
