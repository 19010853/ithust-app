import crypto from 'crypto';
import cloudinary, { UploadApiOptions, UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  approveDeliveryDate,
  approveOrder,
  cancelOrder,
  rejectDeliveryDate,
  requestDeliveryExtension,
  sellerDeliverOrder
} from '@order/services/order.service';
import { orderUpdateSchema } from '@order/schemes/order';
import { BadRequestError, IDeliveredWork, IOrderDocument } from '@19010853/ithust-shared';

const cancel = async (req: Request, res: Response): Promise<void> => {
  const { orderId } = req.params;
  await cancelOrder(orderId, req.body.orderData);
  res.status(StatusCodes.OK).json({ message: 'Order cancelled successfully.' });
};

const requestExtension = async (req: Request, res: Response): Promise<void> => {
  const { error } = await Promise.resolve(orderUpdateSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Update requestExtension() method');
  }
  const { orderId } = req.params;
  const order: IOrderDocument = await requestDeliveryExtension(orderId, req.body);
  res.status(StatusCodes.OK).json({ message: 'Order delivery request', order });
};

const deliveryDate = async (req: Request, res: Response): Promise<void> => {
  const { error } = await Promise.resolve(orderUpdateSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Update deliveryDate() method');
  }
  const { orderId, type } = req.params;
  const order: IOrderDocument = type === 'approve' ? await approveDeliveryDate(orderId, req.body) : await rejectDeliveryDate(orderId);
  res.status(StatusCodes.OK).json({ message: 'Order delivery date extension', order });
};

const buyerApproveOrder = async (req: Request, res: Response): Promise<void> => {
  const { orderId } = req.params;
  const order: IOrderDocument = await approveOrder(orderId, req.body);
  res.status(StatusCodes.OK).json({ message: 'Order approved successfully.', order });
};

const uploadDeliveredWork = async (file: string, fileType: string, publicId: string): Promise<UploadApiResponse> => {
  const normalizedFileType = fileType.toLowerCase();
  const uploadOptions: UploadApiOptions = {
    resource_type: 'auto'
  };

  if (['pdf', 'zip'].includes(normalizedFileType)) {
    uploadOptions.public_id = `${publicId}.${normalizedFileType}`;
  }

  try {
    return await cloudinary.v2.uploader.upload(file, uploadOptions);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'File upload error. Try again';
    throw new BadRequestError(message, 'Update uploadDeliveredWork() method');
  }
};

const deliverOrder = async (req: Request, res: Response): Promise<void> => {
  const { orderId } = req.params;
  let file: string = req.body.file;
  const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randomCharacters: string = randomBytes.toString('hex');
  let result: UploadApiResponse;
  if (file) {
    result = await uploadDeliveredWork(file, `${req.body.fileType}`, randomCharacters);
    if (!result.public_id) {
      throw new BadRequestError('File upload error. Try again', 'Update deliverOrder() method');
    }
    file = result?.secure_url;
  }
  const deliveredWork: IDeliveredWork = {
    message: req.body.message,
    file,
    fileType: req.body.fileType,
    fileName: req.body.fileName,
    fileSize: req.body.fileSize
  };
  const order: IOrderDocument = await sellerDeliverOrder(orderId, true, deliveredWork);
  res.status(StatusCodes.OK).json({ message: 'Order delivered successfully.', order });
};

export { cancel, requestExtension, deliveryDate, buyerApproveOrder, deliverOrder };
