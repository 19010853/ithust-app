import { IResponse } from 'src/shared/shared.interface';
import { api } from 'src/store/api';

export const buyerApi = api.injectEndpoints({
  endpoints: (build) => ({
    getCurrentBuyerByUsername: build.query<IResponse, void>({
      query: () => 'buyer/username',
      providesTags: ['Buyer']
    }),
    getBuyerByUsername: build.query<IResponse, string>({
      query: (username: string) => `buyer/${username}`,
      providesTags: ['Buyer']
    }),
    getBuyerByEmail: build.query<IResponse, void>({
      query: () => 'buyer/email',
      providesTags: ['Buyer']
    }),
    createRefundWithdrawal: build.mutation<IResponse, { buyerId: string; amount: number; paypalEmail: string }>({
      query({ buyerId, amount, paypalEmail }) {
        return {
          url: `buyer/${buyerId}/refund-withdrawal`,
          method: 'POST',
          body: { amount, paypalEmail }
        };
      },
      invalidatesTags: ['Buyer']
    })
  })
});

export const { useGetCurrentBuyerByUsernameQuery, useGetBuyerByUsernameQuery, useGetBuyerByEmailQuery, useCreateRefundWithdrawalMutation } =
  buyerApi;
