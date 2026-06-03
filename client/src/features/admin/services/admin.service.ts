import { IResponse } from 'src/shared/shared.interface';
import { api } from 'src/store/api';

import { IAdminUserFilters } from '../interfaces/admin.interface';

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
    })
  })
});

export const { useGetAdminUsersQuery, useGetAdminUserDetailQuery } = adminApi;
