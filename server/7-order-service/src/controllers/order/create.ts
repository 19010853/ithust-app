import { Request, Response } from 'express';
import { config } from '@order/config';
import { StatusCodes } from 'http-status-codes';
import { orderSchema } from '@order/schemes/order';
import { BadRequestError, IOrderDocument } from '@19010853/ithust-shared';
import { createOrder } from '@order/services/order.service';
import { getUsdToVndRate } from '@order/services/exchange-rate.service';

type SePayOrderData = IOrderDocument & {
  paymentAmountVnd: number;
  paymentCurrency: 'VND';
};

const getTransferContent = (orderId: string): string => {
  const orderReference = `PAYORDER${orderId}`;
  return config.PLATFORM_BANK_ID?.toLowerCase() === 'vietinbank' ? `SEVQR ${orderReference}` : orderReference;
};

const order = async (req: Request, res: Response): Promise<void> => {
  const { error } = await Promise.resolve(orderSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Create order() method');
  }

  const serviceFee: number = req.body.price < 50 ? Number(((5.5 / 100) * req.body.price + 2).toFixed(2)) : Number(((5.5 / 100) * req.body.price).toFixed(2));
  const totalUsd: number = Number((req.body.price + serviceFee).toFixed(2));
  const paymentAmountVnd: number = Math.round(totalUsd * (await getUsdToVndRate()));
  const orderData: SePayOrderData = {
    ...req.body,
    serviceFee,
    status: 'PENDING_PAYMENT',
    paymentAmountVnd,
    paymentCurrency: 'VND',
    paymentStatus: 'PENDING'
  };
  
  const newOrder: IOrderDocument = await createOrder(orderData);

  const transferContent: string = getTransferContent(`${(newOrder as IOrderDocument & { _id: string })._id}`);
  const qrCodeUrl = `https://qr.sepay.vn/img?acc=${config.PLATFORM_BANK_ACCOUNT}&bank=${config.PLATFORM_BANK_ID}&amount=${paymentAmountVnd}&des=${encodeURIComponent(transferContent)}`;

  res.status(StatusCodes.CREATED).json({ 
    message: 'Order created. Please scan QR to pay.', 
    order: newOrder,
    payment: {
      qrCodeUrl,
      amount: paymentAmountVnd,
      currency: 'VND',
      mode: config.getSepayMode(),
      content: transferContent
    }
  });
};

export { order };
