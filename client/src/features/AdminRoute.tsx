import { FC, ReactElement, ReactNode, useCallback, useEffect, useState } from 'react';
import { Navigate, NavigateFunction, useNavigate } from 'react-router-dom';
import { addAuthUser } from 'src/features/auth/reducers/auth.reducer';
import { useCheckCurrentUserQuery } from 'src/features/auth/services/auth.service';
import { applicationLogout, saveToSessionStorage } from 'src/shared/utils/utils.service';
import { useAppDispatch, useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';

export interface IAdminRouteProps {
  children: ReactNode;
}

const AdminRoute: FC<IAdminRouteProps> = ({ children }): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const [tokenIsValid, setTokenIsValid] = useState<boolean>(false);
  const dispatch = useAppDispatch();
  const navigate: NavigateFunction = useNavigate();
  const { data, isError } = useCheckCurrentUserQuery();

  const checkUser = useCallback(async () => {
    if (data && data.user) {
      setTokenIsValid(true);
      dispatch(addAuthUser({ authInfo: data.user }));
      saveToSessionStorage(JSON.stringify(true), JSON.stringify(data.user.username));
    }

    if (isError) {
      setTokenIsValid(false);
      applicationLogout(dispatch, navigate);
    }
  }, [data, dispatch, navigate, isError]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  const currentRole = data?.user?.role || authUser.role;

  if (!data?.user && !authUser.id) {
    return <Navigate to="/" />;
  }

  if (tokenIsValid || authUser.id) {
    return currentRole === 'admin' ? <>{children}</> : <Navigate to="/" />;
  }

  return <></>;
};

export default AdminRoute;
