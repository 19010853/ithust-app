import { IResponse } from 'src/shared/shared.interface';
import { api } from 'src/store/api';

import {
  IDeliveredWork,
  IDisputeDocument,
  IExtendedDelivery,
  IOrderDocument,
  IOrderMessage,
  IRefundRequestPayload
} from '../interfaces/order.interface';

export const ordersApi = api.injectEndpoints({
  endpoints: (build) => ({
    getOrderByOrderId: build.query<IResponse, string>({
      query: (orderId: string) => `order/${orderId}`,
      providesTags: ['Order']
    }),
    getOrdersBySellerId: build.query<IResponse, string>({
      query: (sellerId: string) => `order/seller/${sellerId}`,
      providesTags: ['Order']
    }),
    getOrdersByBuyerId: build.query<IResponse, string>({
      query: (buyerId: string) => `order/buyer/${buyerId}`,
      providesTags: ['Order']
    }),
    createOrder: build.mutation<IResponse, IOrderDocument>({
      query(body: IOrderDocument) {
        return {
          url: 'order',
          method: 'POST',
          body
        };
      },
      invalidatesTags: ['Order']
    }),
    capturePayPalOrder: build.mutation<IResponse, string>({
      query(localOrderId: string) {
        return {
          url: `order/paypal/${localOrderId}/capture`,
          method: 'POST'
        };
      },
      invalidatesTags: ['Order']
    }),
    createRefundRequest: build.mutation<IResponse, { orderId: string; body: IRefundRequestPayload }>({
      query({ orderId, body }) {
        return {
          url: `order/${orderId}/refund`,
          method: 'POST',
          body
        };
      },
      invalidatesTags: ['Order']
    }),
    createDispute: build.mutation<IResponse, { orderId: string; reason: string; evidence?: Array<{ url: string; fileName?: string; fileType?: string }> }>({
      query({ orderId, reason, evidence = [] }) {
        return {
          url: `order/${orderId}/dispute`,
          method: 'POST',
          body: { reason, evidence }
        };
      },
      invalidatesTags: ['Order']
    }),
    getDisputes: build.query<IResponse, { status?: IDisputeDocument['status'] } | undefined>({
      query: (params) => ({
        url: 'order/disputes',
        params
      }),
      providesTags: ['Order']
    }),
    getDisputeMessages: build.query<IResponse, string>({
      query: (disputeId: string) => `order/dispute/${disputeId}/messages`,
      providesTags: ['Order']
    }),
    createDisputeMessage: build.mutation<IResponse, { disputeId: string; body: string; visibility?: 'PARTICIPANTS' | 'ADMIN_INTERNAL' }>({
      query({ disputeId, body, visibility = 'PARTICIPANTS' }) {
        return {
          url: `order/dispute/${disputeId}/messages`,
          method: 'POST',
          body: { body, visibility }
        };
      },
      invalidatesTags: ['Order']
    }),
    decideDispute: build.mutation<
      IResponse,
      { disputeId: string; decision: 'REVISION_REQUIRED' | 'REFUND_BUYER' | 'RELEASE_SELLER'; reason: string; revisionDeadlineAt?: string }
    >({
      query({ disputeId, decision, reason, revisionDeadlineAt }) {
        return {
          url: `order/dispute/${disputeId}/decision`,
          method: 'PUT',
          body: { decision, reason, revisionDeadlineAt }
        };
      },
      invalidatesTags: ['Order']
    }),
    cancelOrder: build.mutation<IResponse, { orderId: string; body: IOrderMessage }>({
      query({ orderId, body }) {
        return {
          url: `order/cancel/${orderId}`,
          method: 'PUT',
          body: { orderData: body }
        };
      },
      invalidatesTags: ['Order']
    }),
    requestDeliveryDateExtension: build.mutation<IResponse, { orderId: string; body: IExtendedDelivery }>({
      query({ orderId, body }) {
        return {
          url: `order/extension/${orderId}`,
          method: 'PUT',
          body
        };
      },
      invalidatesTags: ['Order']
    }),
    updateDeliveryDate: build.mutation<IResponse, { orderId: string; type: string; body: IExtendedDelivery }>({
      query({ orderId, type, body }) {
        return {
          url: `order/gig/${type}/${orderId}`,
          method: 'PUT',
          body
        };
      },
      invalidatesTags: ['Order']
    }),
    deliverOrder: build.mutation<IResponse, { orderId: string; body: IDeliveredWork }>({
      query({ orderId, body }) {
        return {
          url: `order/deliver-order/${orderId}`,
          method: 'PUT',
          body
        };
      },
      invalidatesTags: ['Order']
    }),
    approveOrder: build.mutation<IResponse, { orderId: string; body: IOrderMessage }>({
      query({ orderId, body }) {
        return {
          url: `order/approve-order/${orderId}`,
          method: 'PUT',
          body
        };
      },
      invalidatesTags: ['Order']
    })
  })
});

export const {
  useGetOrderByOrderIdQuery,
  useLazyGetOrderByOrderIdQuery,
  useGetOrdersBySellerIdQuery,
  useGetOrdersByBuyerIdQuery,
  useCreateOrderMutation,
  useCapturePayPalOrderMutation,
  useCreateRefundRequestMutation,
  useCreateDisputeMutation,
  useGetDisputesQuery,
  useGetDisputeMessagesQuery,
  useCreateDisputeMessageMutation,
  useDecideDisputeMutation,
  useCancelOrderMutation,
  useRequestDeliveryDateExtensionMutation,
  useUpdateDeliveryDateMutation,
  useDeliverOrderMutation,
  useApproveOrderMutation
} = ordersApi;
