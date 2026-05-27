import { FC, ReactElement, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';

import { useCheckCurrentUserQuery } from './auth/services/auth.service';

export interface INonAdminRouteProps {
  children: ReactNode;
}

const NonAdminRoute: FC<INonAdminRouteProps> = ({ children }): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const { data } = useCheckCurrentUserQuery(undefined, { skip: authUser.id === null });
  const currentRole = data?.user?.role || authUser.role;

  return currentRole === 'admin' ? <Navigate to="/admin/dashboard" /> : <>{children}</>;
};

export default NonAdminRoute;
