import axios, { AxiosResponse } from 'axios';
import { AxiosService } from '@gateway/services/axios';
import { config } from '@gateway/config';

export let axiosAdminInstance: ReturnType<typeof axios.create>;

class AdminService {
  constructor() {
    const axiosService: AxiosService = new AxiosService(`${config.USERS_BASE_URL}/api/v1/admin`, 'seller');
    axiosAdminInstance = axiosService.axios;
  }

  async getUsers(query: unknown): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosAdminInstance.get('/users', { params: query });
    return response;
  }

  async getUserDetail(username: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosAdminInstance.get(`/users/${username}`);
    return response;
  }

  async getRestrictionPreview(username: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosAdminInstance.get(`/users/${username}/restriction-preview`);
    return response;
  }

  async updateAccountStatus(username: string, body: unknown): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosAdminInstance.patch(`/users/${username}/account-status`, body);
    return response;
  }

  async updateSellerStatus(username: string, body: unknown): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosAdminInstance.patch(`/users/${username}/seller-status`, body);
    return response;
  }
}

export const adminService: AdminService = new AdminService();
