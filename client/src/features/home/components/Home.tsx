import { FC, ReactElement, useEffect } from 'react';
import { ISellerGig } from 'src/features/gigs/interfaces/gig.interface';
import {
  useGetGigsByCategoryQuery,
  useGetTopRatedGigsByCategoryQuery
} from 'src/features/gigs/services/gigs.service';
import { ISellerDocument } from 'src/features/sellers/interfaces/seller.interface';
import { useGetRandomSellersQuery } from 'src/features/sellers/services/seller.service';
import TopGigsView from 'src/shared/gigs/TopGigsView';
import { lowerCase } from 'src/shared/utils/utils.service';
import { socketService } from 'src/sockets/socket.service';
import { useAppSelector } from 'src/store/store';
import { IReduxState } from 'src/store/store.interface';

import FeaturedExperts from './FeaturedExperts';
import HomeGigsView from './HomeGigsView';
import HomeSlider from './HomeSlider';

const categoryLabel = (category?: string): string => {
  const labels: Record<string, string> = {
    Business: 'Kinh doanh',
    Data: 'Dữ liệu',
    'Digital Marketing': 'Marketing số',
    'Graphics & Design': 'Thiết kế đồ họa',
    'Music & Audio': 'Âm nhạc & âm thanh',
    Photography: 'Nhiếp ảnh',
    'Programming & Tech': 'Lập trình & công nghệ',
    'Video & Animation': 'Video & hoạt hình',
    'Writing & Translation': 'Viết lách & dịch thuật'
  };
  return labels[`${category}`] || `${category || ''}`;
};

const Home: FC = (): ReactElement => {
  const authUser = useAppSelector((state: IReduxState) => state.authUser);
  const { data, isSuccess } = useGetRandomSellersQuery('10');
  const { data: categoryData, isSuccess: isCategorySuccess } = useGetGigsByCategoryQuery(`${authUser.username}`);
  const { data: topGigsData, isSuccess: isTopGigsSuccess } = useGetTopRatedGigsByCategoryQuery(`${authUser.username}`);
  // const { data: sellerData, isSuccess: isSellerDataSuccess } = useGetMoreGigsLikeThisQuery('6559d9a3620b7db8c1fb7f01');
  let sellers: ISellerDocument[] = [];
  let categoryGigs: ISellerGig[] = [];
  let topGigs: ISellerGig[] = [];

  if (isSuccess) {
    sellers = data.sellers as ISellerDocument[];
  }

  if (isCategorySuccess) {
    categoryGigs = categoryData.gigs as ISellerGig[];
  }

  if (isTopGigsSuccess) {
    topGigs = topGigsData.gigs as ISellerGig[];
  }

  // if (isSellerDataSuccess) {
  //   topGigs = sellerData.gigs as ISellerGig[];
  // }

  useEffect(() => {
    socketService.setupSocketConnection();
  }, []);

  return (
    <div className="m-auto px-6 w-screen relative min-h-screen xl:container md:px-12 lg:px-6">
      <HomeSlider />
      {topGigs.length > 0 && (
        <TopGigsView
          gigs={topGigs}
          title="Dịch vụ được đánh giá cao trong"
          subTitle={`Những tài năng được đánh giá cao nhất cho nhu cầu ${lowerCase(categoryLabel(topGigs[0].categories))} của bạn.`}
          category={topGigs[0].categories}
          width="w-72"
          type="home"
        />
      )}
      {categoryGigs.length > 0 && (
        <HomeGigsView gigs={categoryGigs} title="Vì bạn đã xem một gig về" subTitle="" category={categoryGigs[0].categories} />
      )}
      <FeaturedExperts sellers={sellers} />
    </div>
  );
};

export default Home;
