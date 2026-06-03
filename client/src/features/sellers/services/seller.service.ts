import { IResponse } from 'src/shared/shared.interface';
import { api } from 'src/store/api';
import { IWithdrawalFilters } from 'src/features/admin/interfaces/admin.interface';

import { ISellerDocument, IWithdrawalDocument } from '../interfaces/seller.interface';

export const sellerApi = api.injectEndpoints({
  endpoints: (build) => ({
    getSellerByUsername: build.query<IResponse, string>({
      query: (username: string) => `seller/username/${username}`,
      providesTags: ['Seller']
    }),
    getSellerById: build.query<IResponse, string>({
      query: (sellerId: string) => `seller/id/${sellerId}`,
      providesTags: ['Seller']
    }),
    getRandomSellers: build.query<IResponse, string>({
      query: (size: string) => `seller/random/${size}`,
      providesTags: ['Seller']
    }),
    createSeller: build.mutation<IResponse, ISellerDocument>({
      query(body: ISellerDocument) {
        return {
          url: 'seller/create',
          method: 'POST',
          body
        };
      },
      invalidatesTags: ['Seller']
    }),
    updateSeller: build.mutation<IResponse, { sellerId: string; seller: ISellerDocument }>({
      query(body) {
        return {
          url: `seller/${body.sellerId}`,
          method: 'PUT',
          body: body.seller
        };
      },
      invalidatesTags: ['Seller']
    }),
    createWithdrawal: build.mutation<IResponse, { sellerId: string; amount: number; bankAccount: { bankName: string; accountNumber: string; accountName: string } }>({
      query(body) {
        return {
          url: `seller/${body.sellerId}/withdraw`,
          method: 'POST',
          body: {
            amount: body.amount,
            bankAccount: body.bankAccount
          }
        };
      },
      invalidatesTags: ['Seller']
    }),
    getWithdrawals: build.query<IResponse, IWithdrawalFilters | undefined>({
      query: (params?: IWithdrawalFilters) => ({
        url: 'seller/withdrawals',
        params: params || {}
      }),
      providesTags: ['Withdrawal']
    }),
    updateWithdrawalStatus: build.mutation<
      IResponse,
      { withdrawalId: string; status: IWithdrawalDocument['status']; adminNote?: string; paymentReference?: string }
    >({
      query(body) {
        return {
          url: `seller/withdrawals/${body.withdrawalId}/status`,
          method: 'PATCH',
          body: {
            status: body.status,
            adminNote: body.adminNote,
            paymentReference: body.paymentReference
          }
        };
      },
      invalidatesTags: ['Withdrawal', 'Seller']
    })
  })
});

export const {
  useGetSellerByUsernameQuery,
  useGetRandomSellersQuery,
  useGetSellerByIdQuery,
  useCreateSellerMutation,
  useUpdateSellerMutation,
  useCreateWithdrawalMutation,
  useGetWithdrawalsQuery,
  useUpdateWithdrawalStatusMutation
} = sellerApi;
