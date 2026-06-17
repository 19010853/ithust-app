import { ChangeEvent, FC, FormEvent, ReactElement, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Alert from 'src/shared/alert/Alert';
import Button from 'src/shared/button/Button';
import Header from 'src/shared/header/components/Header';
import TextInput from 'src/shared/inputs/TextInput';
import { IResponse } from 'src/shared/shared.interface';

import { useAuthSchema } from '../hooks/useAuthSchema';
import { AUTH_FETCH_STATUS, IResetPassword } from '../interfaces/auth.interface';
import { resetPasswordSchema } from '../schemes/auth.schema';
import { useResetPasswordMutation } from '../services/auth.service';

const ResetPassword: FC = (): ReactElement => {
  const [alertMessage, setAlertMessage] = useState<string>('');
  const [userInfo, setUserInfo] = useState<IResetPassword>({
    password: '',
    confirmPassword: ''
  });
  const [status, setStatus] = useState<string>(AUTH_FETCH_STATUS.IDLE);
  const [schemaValidation, validationErrors] = useAuthSchema({ schema: resetPasswordSchema, userInfo });
  const [searchParams] = useSearchParams({});
  const navigate = useNavigate();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  useEffect(() => {
    if (validationErrors.length > 0) {
      const firstError = validationErrors[0];
      const errorMessage = typeof firstError === 'string' ? firstError : Object.values(firstError)[0];
      setAlertMessage(errorMessage as string);
      setStatus(AUTH_FETCH_STATUS.ERROR);
    }
  }, [validationErrors]);

  const onResetPassword = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    try {
      const isValid: boolean = await schemaValidation();
      if (isValid) {
        const result: IResponse = await resetPassword({
          password: userInfo.password,
          confirmPassword: userInfo.confirmPassword,
          token: `${searchParams.get('token')}`
        }).unwrap();
        setAlertMessage(`${result.message}`);
        setStatus(AUTH_FETCH_STATUS.SUCCESS);
        setUserInfo({ password: '', confirmPassword: '' });
        setTimeout(() => navigate('/'), 1000);
      }
    } catch (error) {
      setStatus(AUTH_FETCH_STATUS.ERROR);
      setAlertMessage(error?.data.message);
    }
  };

  return (
    <>
      <Header navClass="navbar peer-checked:navbar-active fixed z-20 w-full border-b border-gray-100 bg-white/90 shadow-2xl shadow-gray-600/5 backdrop-blur dark:border-gray-800 dark:bg-gray-900/80 dark:shadow-none" />
      <div className="relative mt-24 mx-auto w-11/12 max-w-md rounded-lg bg-white md:w-2/3">
        <div className="relative px-5 py-5">
          <h2 className="text-center text-xl font-bold leading-tight tracking-tight dark:text-black md:text-2xl mb-2">Đặt lại mật khẩu</h2>
          {alertMessage && <Alert type={status} message={alertMessage} />}
          <form className="mt-4 space-y-4 md:space-y-5 lg:mt-5">
            <div>
              <label htmlFor="password" className="text-sm font-bold leading-tight tracking-normal text-gray-800">
                Mật khẩu
              </label>
              <TextInput
                id="password"
                name="password"
                type="password"
                value={userInfo.password}
                className="flex h-10 w-full items-center rounded border border-gray-300 pl-3 text-sm font-normal text-gray-600 focus:border focus:border-sky-500/50 focus:outline-none"
                placeholder="Nhập mật khẩu"
                onChange={(event: ChangeEvent) => {
                  setUserInfo({ ...userInfo, password: (event.target as HTMLInputElement).value });
                }}
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-bold leading-tight tracking-normal text-gray-800">
                Xác nhận mật khẩu
              </label>
              <TextInput
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={userInfo.confirmPassword}
                className="flex h-10 w-full items-center rounded border border-gray-300 pl-3 text-sm font-normal text-gray-600 focus:border focus:border-sky-500/50 focus:outline-none"
                placeholder="Nhập lại mật khẩu"
                onChange={(event: ChangeEvent) => {
                  setUserInfo({ ...userInfo, confirmPassword: (event.target as HTMLInputElement).value });
                }}
              />
            </div>
            <Button
              disabled={!userInfo.password || !userInfo.confirmPassword}
              className={`text-md block w-full cursor-pointer rounded bg-sky-500 px-8 py-2 text-center font-bold text-white hover:bg-sky-400 focus:outline-none ${
                !userInfo.password || !userInfo.confirmPassword ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
              label={`${isLoading ? 'ĐANG ĐẶT LẠI MẬT KHẨU...' : 'ĐẶT LẠI MẬT KHẨU'}`}
              onClick={onResetPassword}
            />
          </form>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
