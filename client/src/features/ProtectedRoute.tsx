import { FC, ReactElement, ReactNode, useCallback, useEffect } from 'react';
import { Navigate, NavigateFunction, useNavigate } from 'react-router-dom';
import HomeHeader from 'src/shared/header/components/HomeHeader';
import { applicationLogout, saveToSessionStorage } from 'src/shared/utils/utils.service';
import { useAppDispatch, useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';
import { addAuthUser } from './auth/reducers/auth.reducer';
import { useCheckCurrentUserQuery } from './auth/services/auth.service';

export interface IProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: FC<IProtectedRouteProps> = ({ children }): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const showCategoryContainer = useAppSelector((state: IReduxState) => state.showCategoryContainer);
  const header = useAppSelector((state: IReduxState) => state.header);
  const dispatch = useAppDispatch();
  const navigate: NavigateFunction = useNavigate();
  const { data, isError, isLoading, isFetching } = useCheckCurrentUserQuery();

  const checkUser = useCallback(async () => {
    if (data && data.user) {
      dispatch(addAuthUser({ authInfo: data.user }));
      saveToSessionStorage(JSON.stringify(true), JSON.stringify(data.user.username));
    }

    if (isError) {
      applicationLogout(dispatch, navigate);
      navigate('/errors/401');
    }
  }, [data, dispatch, navigate, isError]);

  useEffect(() => {
    checkUser();
  }, [checkUser]);

  if (isLoading || isFetching) {
    return <></>;
  }

  if (!data?.user && !authUser.id) {
    return <Navigate to="/errors/401" />;
  }

  const currentRole = `${data?.user?.role || authUser.role || ''}`.toLowerCase();

  if (currentRole === 'admin') {
    return <Navigate to="/admin/users" />;
  }

  return (
    <>
      {header && header === 'home' && <HomeHeader showCategoryContainer={showCategoryContainer} />}
      {children}
    </>
  );
};

export default ProtectedRoute;
