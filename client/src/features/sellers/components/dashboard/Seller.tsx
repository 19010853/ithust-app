import { FC, ReactElement, useEffect } from 'react';
import { Outlet, useParams } from 'react-router-dom';
import { ISellerGig } from 'src/features/gigs/interfaces/gig.interface';
import { useGetGigsBySellerIdQuery, useGetSellerPausedGigsQuery } from 'src/features/gigs/services/gigs.service';
import { IOrderDocument } from 'src/features/order/interfaces/order.interface';
import { useGetOrdersBySellerIdQuery } from 'src/features/order/services/order.service';
import DashboardHeader from 'src/shared/header/components/DashboardHeader';
import { updateHeader } from 'src/shared/header/reducers/header.reducer';
import { useAppDispatch } from 'src/store/store';

import { ISellerDocument } from '../../interfaces/seller.interface';
import { useGetSellerByIdQuery } from '../../services/seller.service';

const Seller: FC = (): ReactElement => {
  const { sellerId } = useParams<string>();
  const dispatch = useAppDispatch();
  const { data, isSuccess } = useGetSellerByIdQuery(`${sellerId}`);

  useEffect(() => {
    dispatch(updateHeader('sellerDashboard'));
    return () => {
      dispatch(updateHeader('home'));
    };
  }, [dispatch]);
  const { data: sellerGigs, isSuccess: isSellerGigsSuccess } = useGetGigsBySellerIdQuery(`${sellerId}`);
  const { data: sellerPausedGigs, isSuccess: isSellerPausedGigsSuccess } = useGetSellerPausedGigsQuery(`${sellerId}`);
  const { data: sellerOrders, isSuccess: isSellerOrdersSuccess } = useGetOrdersBySellerIdQuery(`${sellerId}`);
  let gigs: ISellerGig[] = [];
  let pausedGigs: ISellerGig[] = [];
  let orders: IOrderDocument[] = [];
  let seller: ISellerDocument | undefined = undefined;

  if (isSuccess) {
    seller = data?.seller as ISellerDocument;
  }

  if (isSellerGigsSuccess) {
    gigs = sellerGigs?.gigs as ISellerGig[];
  }

  if (isSellerPausedGigsSuccess) {
    pausedGigs = sellerPausedGigs?.gigs as ISellerGig[];
  }

  if (isSellerOrdersSuccess) {
    orders = sellerOrders?.orders as IOrderDocument[];
  }

  return (
    <div className="relative w-screen">
      <DashboardHeader />
      <div className="m-auto px-6 w-screen xl:container md:px-12 lg:px-6 relative min-h-screen">
        <Outlet context={{ seller, gigs, pausedGigs, orders }} />
      </div>
    </div>
  );
};

export default Seller;
