import { FC, ReactElement } from 'react';
import { NavigateFunction, useNavigate, useParams } from 'react-router-dom';
import Button from 'src/shared/button/Button';

type ErrorStatusCode = '400' | '401' | '403' | '404' | '500' | '503';

const errorContent: Record<ErrorStatusCode, { body: string; title: string }> = {
  '400': {
    title: 'Request sai',
    body: 'Yeu cau khong hop le hoac thieu du lieu can thiet.'
  },
  '401': {
    title: 'Chua dang nhap',
    body: 'Ban can dang nhap de tiep tuc su dung tinh nang nay.'
  },
  '403': {
    title: 'Khong co quyen',
    body: 'Tai khoan cua ban khong co quyen truy cap khu vuc nay.'
  },
  '404': {
    title: 'Khong tim thay',
    body: 'Trang hoac tai nguyen ban dang tim kiem khong ton tai.'
  },
  '500': {
    title: 'Loi he thong',
    body: 'He thong dang gap su co. Vui long thu lai sau.'
  },
  '503': {
    title: 'Bao tri / qua tai',
    body: 'Dich vu dang bao tri hoac tam thoi qua tai. Vui long quay lai sau.'
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
        label={code === '401' ? 'Go to Login' : 'Go Back'}
      />
    </div>
  );
};

export default Error;
