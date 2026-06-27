import { AxiosService } from '@gateway/services/axios';
import { IOrderDocument, IExtendedDelivery, IDeliveredWork, IOrderMessage } from '@19010853/ithust-shared';
import axios, { AxiosResponse } from 'axios';

export let axiosOrderInstance: ReturnType<typeof axios.create>;

class OrderService {
  constructor() {
    const axiosService: AxiosService = new AxiosService(`${process.env.ORDER_BASE_URL}/api/v1/order`, 'order');
    axiosOrderInstance = axiosService.axios;
  }

  async getOrderById(orderId: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.get(`/${orderId}`);
    return response;
  }

  async sellerOrders(sellerId: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.get(`/seller/${sellerId}`);
    return response;
  }

  async buyerOrders(buyerId: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.get(`/buyer/${buyerId}`);
    return response;
  }

  async stripeWebhook(body: unknown, stripeSignature: string, rawBody?: Buffer): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.post('/stripe/webhook', rawBody || body, {
      headers: {
        'stripe-signature': stripeSignature,
        ...(rawBody ? { 'Content-Type': 'application/json' } : {})
      },
      transformRequest: rawBody ? [(data) => data] : undefined
    });
    return response;
  }

  async createOrder(body: IOrderDocument): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.post('/', body);
    return response;
  }

  async createRefundRequest(orderId: string, body: unknown): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.post(`/refund/${orderId}`, body);
    return response;
  }

  async createDispute(orderId: string, body: unknown): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.post(`/dispute/${orderId}`, body);
    return response;
  }

  async getDisputes(query: unknown): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.get('/disputes', { params: query });
    return response;
  }

  async getDisputeMessages(disputeId: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.get(`/dispute/${disputeId}/messages`);
    return response;
  }

  async createDisputeMessage(disputeId: string, body: unknown): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.post(`/dispute/${disputeId}/messages`, body);
    return response;
  }

  async decideDispute(disputeId: string, body: unknown): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.put(`/dispute/${disputeId}/decision`, body);
    return response;
  }

  async cancelOrder(orderId: string, body: IOrderMessage): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.put(`/cancel/${orderId}`, { orderData: body });
    return response;
  }

  async requestDeliveryDateExtension(orderId: string, body: IExtendedDelivery): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.put(`/extension/${orderId}`, body);
    return response;
  }

  async updateDeliveryDate(orderId: string, type: string, body: IExtendedDelivery): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.put(`/gig/${type}/${orderId}`, body);
    return response;
  }

  async deliverOrder(orderId: string, body: IDeliveredWork): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.put(`/deliver-order/${orderId}`, body);
    return response;
  }

  async approveOrder(orderId: string, body: IOrderMessage): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.put(`/approve-order/${orderId}`, body);
    return response;
  }

  async getNotifications(userTo: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.get(`/notification/${userTo}`);
    return response;
  }

  async markNotificationAsRead(notificationId: string): Promise<AxiosResponse> {
    const response: AxiosResponse = await axiosOrderInstance.put('/notification/mark-as-read', { notificationId });
    return response;
  }
}

export const orderService: OrderService = new OrderService();
