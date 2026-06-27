import Joi, { ObjectSchema } from 'joi';

const ORDER_MIN_PRICE_VND = 100000;
const ORDER_MAX_PRICE_VND = 250000000;

const orderPriceSchema = Joi.number().integer().min(ORDER_MIN_PRICE_VND).max(ORDER_MAX_PRICE_VND).messages({
  'number.base': 'Order price must be a number',
  'number.integer': 'Order price must be a whole VND amount',
  'number.min': `Order price must be at least ${ORDER_MIN_PRICE_VND} VND`,
  'number.max': `Order price must be at most ${ORDER_MAX_PRICE_VND} VND`
});

const orderSchema: ObjectSchema = Joi.object().keys({
  offer: Joi.object({
    gigTitle: Joi.string().required(),
    price: orderPriceSchema.required(),
    description: Joi.string().required(),
    deliveryInDays: Joi.number().required(),
    oldDeliveryDate: Joi.string().required(),
    newDeliveryDate: Joi.string().optional(),
    accepted: Joi.boolean().required(),
    cancelled: Joi.boolean().required()
  }).required(),
  gigId: Joi.string().required(),
  sellerId: Joi.string().required(),
  sellerUsername: Joi.string().required(),
  sellerEmail: Joi.string().required(),
  sellerImage: Joi.string().required(),
  gigCoverImage: Joi.string().required(),
  gigMainTitle: Joi.string().required(),
  gigBasicTitle: Joi.string().required(),
  gigBasicDescription: Joi.string().required(),
  buyerId: Joi.string().required(),
  buyerUsername: Joi.string().required(),
  buyerEmail: Joi.string().required(),
  buyerImage: Joi.string().required(),
  status: Joi.string().required(),
  orderId: Joi.string().required(),
  invoiceId: Joi.string().required(),
  quantity: Joi.number().required(),
  price: orderPriceSchema.required(),
  serviceFee: Joi.number().integer().min(0).optional().messages({
    'number.base': 'Service fee must be a number',
    'number.integer': 'Service fee must be a whole VND amount',
    'number.min': 'Service fee must be zero or greater'
  }),
  requirements: Joi.string().optional().allow(null, ''),
  requestExtension: Joi.object({
    originalDate: Joi.string().required(),
    newDate: Joi.string().required(),
    days: Joi.number().required(),
    reason: Joi.string().required()
  }).optional(),
  delivered: Joi.boolean().optional(),
  approvedAt: Joi.string().optional(),
  deliveredWork: Joi.array()
    .items(
      Joi.object({
        message: Joi.string(),
        file: Joi.string()
      })
    )
    .optional(),
  dateOrdered: Joi.string().optional(),
  events: Joi.object({
    placeOrder: Joi.string(),
    requirements: Joi.string(),
    orderStarted: Joi.string(),
    deliverydateUpdate: Joi.string().optional(),
    orderDelivered: Joi.string().optional(),
    buyerReview: Joi.string().optional(),
    sellerReview: Joi.string().optional()
  }).optional(),
  buyerReview: Joi.object({
    rating: Joi.number(),
    review: Joi.string()
  }).optional(),
  sellerReview: Joi.object({
    rating: Joi.number(),
    review: Joi.string()
  }).optional()
});

const orderUpdateSchema: ObjectSchema = Joi.object().keys({
  originalDate: Joi.string().required(),
  newDate: Joi.string().required(),
  days: Joi.number().required(),
  reason: Joi.string().required(),
  deliveryDateUpdate: Joi.string().optional()
});

const refundRequestSchema: ObjectSchema = Joi.object().keys({
  reason: Joi.string().trim().min(10).max(1000).required(),
  bankInfo: Joi.object({
    bankName: Joi.string().trim().allow('').optional(),
    accountNumber: Joi.string().trim().allow('').optional(),
    accountName: Joi.string().trim().allow('').optional()
  }).optional()
});

export { orderSchema, orderUpdateSchema, refundRequestSchema };
