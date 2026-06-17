import { FC, ReactElement } from 'react';
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom';
import Button from 'src/shared/button/Button';

type ErrorStatusCode = '400' | '401' | '403' | '404' | '500' | '503';

const errorContent: Record<ErrorStatusCode, { body: string; title: string }> = {
  '400': {
    title: 'Yêu cầu không hợp lệ',
    body: 'Yêu cầu không hợp lệ hoặc thiếu dữ liệu cần thiết.'
  },
  '401': {
    title: 'Chưa đăng nhập',
    body: 'Bạn cần đăng nhập để tiếp tục sử dụng tính năng này.'
  },
  '403': {
    title: 'Không có quyền',
    body: 'Tài khoản của bạn không có quyền truy cập khu vực này.'
  },
  '404': {
    title: 'Không tìm thấy',
    body: 'Trang hoặc tài nguyên bạn đang tìm kiếm không tồn tại.'
  },
  '500': {
    title: 'Lỗi hệ thống',
    body: 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.'
  },
  '503': {
    title: 'Bảo trì hoặc quá tải',
    body: 'Dịch vụ đang bảo trì hoặc tạm thời quá tải. Vui lòng quay lại sau.'
  }
};

const getStatusCode = (statusCode?: string): ErrorStatusCode => {
  return ['400', '401', '403', '404', '500', '503'].includes(`${statusCode}`) ? (`${statusCode}` as ErrorStatusCode) : '404';
};

const Error: FC = (): ReactElement => {
  const navigate: NavigateFunction = useNavigate();
  const { statusCode } = useParams();
  const code = getStatusCode(statusCode);
  const content = errorContent[code];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-6 text-center">
      <div className="text-7xl font-black text-sky-500 md:text-8xl lg:text-9xl">{code}</div>
      <h1 className="mt-5 text-2xl font-bold text-gray-900 md:text-3xl">{content.title}</h1>
      <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600 md:text-base">{content.body}</p>
      <Button
        onClick={() => (code === '401' ? navigate('/') : navigate(-1))}
        disabled={false}
        className="mt-5 rounded bg-sky-500 px-6 py-3 text-center text-sm font-bold text-white hover:bg-sky-400 focus:outline-none md:px-4 md:py-2 md:text-base"
        label={code === '401' ? 'Đi đến đăng nhập' : 'Quay lại'}
      />
    </div>
  );
};

export default Error;
