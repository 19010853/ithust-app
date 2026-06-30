import { FC, ReactNode, Suspense } from 'react';
import { RouteObject, useRoutes } from 'react-router-dom';

import AppPage from './features/AppPage';
import AdminRoute from './features/AdminRoute';
import AdminInbox from './features/admin/components/AdminInbox';
import AdminSettings from './features/admin/components/AdminSettings';
import AdminUsers from './features/admin/components/AdminUsers';
import AdminWithdrawals from './features/admin/components/AdminWithdrawals';
import ConfirmEmail from './features/auth/components/ConfirmEmail';
import ResetPassword from './features/auth/components/ResetPassword';
import VerifyOTP from './features/auth/components/VerifyOTP';
import BuyerDashboard from './features/buyer/components/Dashboard';
import Chat from './features/chat/components/Chat';
import Error from './features/error/Error';
import AddGig from './features/gigs/components/gig/AddGig';
import EditGig from './features/gigs/components/gig/EditGig';
import Gigs from './features/gigs/components/gigs/Gigs';
import GigView from './features/gigs/components/view/GigView';
import Home from './features/home/components/Home';
import GigInfoDisplay from './features/index/gig-tabs/GigInfoDisplay';
import GigsIndexDisplay from './features/index/gig-tabs/GigsIndexDisplay';
import NonAdminRoute from './features/NonAdminRoute';
import Checkout from './features/order/components/Checkout';
import Order from './features/order/components/Order';
import Requirement from './features/order/components/Requirement';
import ProtectedRoute from './features/ProtectedRoute';
import AddSeller from './features/sellers/components/add/AddSeller';
import ManageEarnings from './features/sellers/components/dashboard/ManageEarnings';
import ManageOrders from './features/sellers/components/dashboard/ManageOrders';
import Seller from './features/sellers/components/dashboard/Seller';
import SellerDashboard from './features/sellers/components/dashboard/SellerDashboard';
import StripeConnectReturn from './features/sellers/components/dashboard/StripeConnectReturn';
import CurrentSellerProfile from './features/sellers/components/profile/CurrentSellerProfile';
import SellerProfile from './features/sellers/components/profile/SellerProfile';
import Settings from './features/settings/components/Settings';
import AdminHeader from './shared/header/components/AdminHeader';

const Layout = ({ backgroundColor = '#fff', children }: { backgroundColor: string; children: ReactNode }): JSX.Element => (
  <div style={{ backgroundColor }} className="flex flex-grow">
    {children}
  </div>
);

const AdminLayout = ({ children }: { children: ReactNode }): JSX.Element => (
  <div className="flex min-h-screen w-full flex-col bg-white">
    <AdminHeader />
    <div className="flex flex-grow">{children}</div>
  </div>
);

const AppRouter: FC = () => {
  const routes: RouteObject[] = [
    {
      path: '/',
      element: <AppPage />
    },
    {
      path: 'reset_password',
      element: (
        <Suspense>
          <ResetPassword />
        </Suspense>
      )
    },
    {
      path: 'confirm_email',
      element: (
        <Suspense>
          <ConfirmEmail />
        </Suspense>
      )
    },
    {
      path: 'verify_otp',
      element: (
        <Suspense>
          <VerifyOTP />
        </Suspense>
      )
    },
    {
      path: '/errors/:statusCode',
      element: (
        <Suspense>
          <Error />
        </Suspense>
      )
    },
    {
      path: '/search/categories/:category',
      element: (
        <Suspense>
          <NonAdminRoute>
            <Layout backgroundColor="#ffffff">
              <GigsIndexDisplay type="categories" />
            </Layout>
          </NonAdminRoute>
        </Suspense>
      )
    },
    {
      path: '/gigs/search',
      element: (
        <Suspense>
          <NonAdminRoute>
            <Layout backgroundColor="#ffffff">
              <GigsIndexDisplay type="search" />
            </Layout>
          </NonAdminRoute>
        </Suspense>
      )
    },
    {
      path: '/gig/:gigId/:title',
      element: (
        <Suspense>
          <NonAdminRoute>
            <Layout backgroundColor="#ffffff">
              <GigInfoDisplay />
            </Layout>
          </NonAdminRoute>
        </Suspense>
      )
    },
    {
      path: '/',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <Home />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/admin/dashboard',
      element: (
        <Suspense>
          <AdminRoute>
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </AdminRoute>
        </Suspense>
      )
    },
    {
      path: '/admin/withdrawals',
      element: (
        <Suspense>
          <AdminRoute>
            <AdminLayout>
              <AdminWithdrawals />
            </AdminLayout>
          </AdminRoute>
        </Suspense>
      )
    },
    {
      path: '/admin/users',
      element: (
        <Suspense>
          <AdminRoute>
            <AdminLayout>
              <AdminUsers />
            </AdminLayout>
          </AdminRoute>
        </Suspense>
      )
    },
    {
      path: '/admin/settings',
      element: (
        <Suspense>
          <AdminRoute>
            <AdminLayout>
              <AdminSettings />
            </AdminLayout>
          </AdminRoute>
        </Suspense>
      )
    },
    {
      path: '/admin/inbox',
      element: (
        <Suspense>
          <AdminRoute>
            <AdminLayout>
              <AdminInbox />
            </AdminLayout>
          </AdminRoute>
        </Suspense>
      )
    },
    {
      path: '/admin/inbox/:username',
      element: (
        <Suspense>
          <AdminRoute>
            <AdminLayout>
              <AdminInbox />
            </AdminLayout>
          </AdminRoute>
        </Suspense>
      )
    },
    {
      path: '/admin/inbox/:username/:conversationId',
      element: (
        <Suspense>
          <AdminRoute>
            <AdminLayout>
              <AdminInbox />
            </AdminLayout>
          </AdminRoute>
        </Suspense>
      )
    },
    {
      path: '/users/:username/:buyerId/orders',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <BuyerDashboard />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/seller_onboarding',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <AddSeller />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/seller_profile/:username/:sellerId/edit',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <CurrentSellerProfile />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/seller_profile/:username/:sellerId/view',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <SellerProfile />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/seller/stripe/return',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <StripeConnectReturn />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/seller/stripe/refresh',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <StripeConnectReturn />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/:username/:sellerId',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <Seller />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      ),
      children: [
        {
          path: 'seller_dashboard',
          element: <SellerDashboard />
        },
        {
          path: 'manage_orders',
          element: <ManageOrders />
        },
        {
          path: 'manage_earnings',
          element: <ManageEarnings />
        }
      ]
    },
    {
      path: '/manage_gigs/new/:sellerId',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <AddGig />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/manage_gigs/edit/:gigId',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <EditGig />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/gig/:username/:title/:sellerId/:gigId/view',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <GigView />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/categories/:category',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <Gigs type="categories" />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/search/gigs',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <Gigs type="search" />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/inbox',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <Chat />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/inbox/:username/:conversationId',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <Chat />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/gig/checkout/:gigId',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <Checkout />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/gig/order/requirement/:gigId',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#ffffff">
              <Requirement />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/orders/:orderId/activities',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#f5f5f5">
              <Order />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '/:username/edit',
      element: (
        <Suspense>
          <ProtectedRoute>
            <Layout backgroundColor="#f5f5f5">
              <Settings />
            </Layout>
          </ProtectedRoute>
        </Suspense>
      )
    },
    {
      path: '*',
      element: (
        <Suspense>
          <Error />
        </Suspense>
      )
    }
  ];

  return useRoutes(routes);
};

export default AppRouter;
