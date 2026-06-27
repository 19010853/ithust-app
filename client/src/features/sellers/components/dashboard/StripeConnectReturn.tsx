import { FC, ReactElement, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageMessage from 'src/shared/page-message/PageMessage';
import { showErrorToast, showSuccessToast } from 'src/shared/utils/utils.service';

import { useGetStripeAccountStatusQuery } from '../../services/seller.service';

const StripeConnectReturn: FC = (): ReactElement => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sellerId = searchParams.get('sellerId') || '';
  const { data, error, isFetching } = useGetStripeAccountStatusQuery(sellerId, { skip: !sellerId });
  const seller = data?.seller;

  useEffect(() => {
    if (!sellerId) {
      showErrorToast('Thiếu mã người bán từ Stripe.');
      return;
    }

    if (seller?._id && seller.username) {
      showSuccessToast('Đã cập nhật trạng thái Stripe Connect.');
      const timeout = window.setTimeout(() => {
        navigate(`/${seller.username}/${seller._id}/manage_earnings`, { replace: true });
      }, 1000);
      return () => window.clearTimeout(timeout);
    }

    if (error) {
      showErrorToast('Không thể cập nhật trạng thái Stripe Connect.');
    }
  }, [error, navigate, seller, sellerId]);

  const message = !sellerId
    ? 'Thiếu mã người bán từ Stripe.'
    : isFetching
      ? 'Đang cập nhật trạng thái Stripe Connect...'
      : 'Đã nhận phản hồi từ Stripe. Bạn sẽ được chuyển về trang doanh thu.';

  return <PageMessage header="Stripe Connect" body={message} />;
};

export default StripeConnectReturn;
