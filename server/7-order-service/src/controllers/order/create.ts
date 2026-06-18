import { Request, Response } from 'express';
import { config } from '@order/config';
import { StatusCodes } from 'http-status-codes';
import { orderSchema } from '@order/schemes/order';
import { BadRequestError, IOrderDocument } from '@19010853/ithust-shared';
import { createOrder } from '@order/services/order.service';

type SePayOrderData = IOrderDocument & {
  paymentAmountVnd: number;
  paymentCurrency: 'VND';
};

const SERVICE_FEE_RATE = 0.055;
const SERVICE_FEE_THRESHOLD_VND = 1250000;
const SERVICE_FEE_FIXED_AMOUNT_VND = 50000;

const calculateServiceFeeVnd = (price: number): number =>
  Math.round(price * SERVICE_FEE_RATE + (price < SERVICE_FEE_THRESHOLD_VND ? SERVICE_FEE_FIXED_AMOUNT_VND : 0));

const getTransferContent = (orderId: string): string => {
  const orderReference = `PAYORDER${orderId}`;
  return config.PLATFORM_BANK_ID?.toLowerCase() === 'vietinbank' ? `SEVQR ${orderReference}` : orderReference;
};

const order = async (req: Request, res: Response): Promise<void> => {
  const { error } = await Promise.resolve(orderSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Create order() method');
  }

  const serviceFee: number = calculateServiceFeeVnd(req.body.price);
  const paymentAmountVnd: number = req.body.price + serviceFee;
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
