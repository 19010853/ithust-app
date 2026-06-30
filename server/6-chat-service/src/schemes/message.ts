import Joi, { ObjectSchema, StringSchema } from 'joi';

const OFFER_MIN_PRICE_VND = 100000;
const OFFER_MAX_PRICE_VND = 250000000;

const requiredText = (message: string): StringSchema => {
  return Joi.string().trim().invalid('undefined', 'null').required().messages({
    'string.base': message,
    'string.empty': message,
    'any.invalid': message,
    'any.required': message
  });
};

const messageSchema: ObjectSchema = Joi.object().keys({
  conversationId: Joi.string().optional().allow(null, ''),
  _id: Joi.string().optional(),
  body: Joi.string().optional().allow(null, ''),
  hasConversationId: Joi.boolean().optional(), // this is only for checking if conversation id exist
  file: Joi.string().optional().allow(null, ''),
  fileType: Joi.string().optional().allow(null, ''),
  fileName: Joi.string().optional().allow(null, ''),
  fileSize: Joi.string().optional().allow(null, ''),
  gigId: Joi.string().optional().allow(null, ''),
  sellerId: Joi.when('isAdminChat', {
    is: true,
    then: Joi.string().optional().allow(null, ''),
    otherwise: requiredText('Seller id is required')
  }),
  buyerId: Joi.when('isAdminChat', {
    is: true,
    then: Joi.string().optional().allow(null, ''),
    otherwise: requiredText('Buyer id is required')
  }),
  isAdminChat: Joi.boolean().optional(),
  senderUsername: requiredText('Sender username is required'),
  senderPicture: requiredText('Sender picture is required'),
  receiverUsername: requiredText('Receiver username is required'),
  receiverPicture: requiredText('Receiver picture is required'),
  isRead: Joi.boolean().optional(),
  hasOffer: Joi.boolean().optional(),
  offer: Joi.object({
    gigTitle: Joi.string().optional(),
    price: Joi.number().integer().min(OFFER_MIN_PRICE_VND).max(OFFER_MAX_PRICE_VND).optional().messages({
      'number.base': 'Offer price must be a number',
      'number.integer': 'Offer price must be a whole VND amount',
      'number.min': `Offer price must be at least ${OFFER_MIN_PRICE_VND} VND`,
      'number.max': `Offer price must be at most ${OFFER_MAX_PRICE_VND} VND`
    }),
    description: Joi.string().optional(),
    deliveryInDays: Joi.number().optional(),
    oldDeliveryDate: Joi.string().optional(),
    newDeliveryDate: Joi.string().optional(),
    accepted: Joi.boolean().optional(),
    cancelled: Joi.boolean().optional()
  }).optional(),
  createdAt: Joi.string().optional()
});

export { messageSchema };
