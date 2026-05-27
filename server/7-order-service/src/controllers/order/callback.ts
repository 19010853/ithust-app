import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { OrderModel } from '@order/models/order.schema';

type SePayOrderDocument = {
  paymentAmountVnd?: number;
  paymentStatus?: string;
  status: string;
  paymentTransactionId?: string | number;
  save: () => Promise<unknown>;
};

export const sepayCallback = async (req: Request, res: Response): Promise<Response | void> => {
  // SePay Test mode uses `content`; keep `transferContent` for compatibility with existing callers.
  const { transferAmount } = req.body;
  const transferContent = req.body.transferContent || req.body.content;

  if (!transferAmount || !transferContent) {
    return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Invalid payload' });
  }

  const match = transferContent.match(/PAYORDER([a-fA-F0-9]{24})/);
  if (!match) {
    // Cannot find order ID in transfer content
    return res.status(StatusCodes.OK).json({ success: true, message: 'No valid order ID found, ignoring' });
  }

  const orderId = match[1];
  const paymentTransactionId: string = `${req.body.id || ''}`;

  try {
    if (paymentTransactionId) {
      const processedOrder = await OrderModel.findOne({ paymentTransactionId }).exec();
      if (processedOrder) {
        return res.status(StatusCodes.OK).json({ success: true, message: 'Transaction already processed' });
      }
    }

    // 4. Find Order in DB
    const order = await OrderModel.findById(orderId).exec();

    if (!order) {
      return res.status(StatusCodes.OK).json({ success: true, message: 'Order not found' });
    }

    const sepayOrder: SePayOrderDocument = order as unknown as SePayOrderDocument;

    if (!sepayOrder.paymentAmountVnd || Number(transferAmount) !== Number(sepayOrder.paymentAmountVnd)) {
      return res.status(StatusCodes.OK).json({ success: true, message: 'Transfer amount does not match order amount' });
    }

    if (sepayOrder.status !== 'IN_PROGRESS') {
      sepayOrder.status = 'IN_PROGRESS';
      sepayOrder.paymentStatus = 'HELD';
      // Save payment transaction info
      if (paymentTransactionId) {
        sepayOrder.paymentTransactionId = paymentTransactionId;
      }
      await sepayOrder.save();
      
      // We should ideally trigger notification service here (this is often handled by order.service.ts or events)
    }

    return res.status(StatusCodes.OK).json({ success: true });
  } catch (error: any) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: error.message });
  }
};
