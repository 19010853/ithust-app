import { IResponse } from 'src/shared/shared.interface';
import { api } from 'src/store/api';

import { IAdminUserFilters, IRestrictionStatusPayload } from '../interfaces/admin.interface';

export const adminApi = api.injectEndpoints({
  endpoints: (build) => ({
    getAdminUsers: build.query<IResponse, IAdminUserFilters>({
      query: (params) => ({
        url: 'admin/users',
        params
      }),
      providesTags: ['Admin']
    }),
    getAdminUserDetail: build.query<IResponse, string>({
      query: (username) => `admin/users/${username}`,
      providesTags: ['Admin']
    }),
    getRestrictionPreview: build.query<IResponse, string>({
      query: (username) => `admin/users/${username}/restriction-preview`,
      providesTags: ['Admin']
    }),
    updateAccountStatus: build.mutation<IResponse, { username: string; body: IRestrictionStatusPayload }>({
      query({ username, body }) {
        return {
          url: `admin/users/${username}/account-status`,
          method: 'PATCH',
          body
        };
      },
      invalidatesTags: ['Admin']
    }),
    updateSellerStatus: build.mutation<IResponse, { username: string; body: IRestrictionStatusPayload }>({
      query({ username, body }) {
        return {
          url: `admin/users/${username}/seller-status`,
          method: 'PATCH',
          body
        };
      },
      invalidatesTags: ['Admin']
    })
  })
});

export const {
  useGetAdminUsersQuery,
  useGetAdminUserDetailQuery,
  useGetRestrictionPreviewQuery,
  useUpdateAccountStatusMutation,
  useUpdateSellerStatusMutation
} = adminApi;
