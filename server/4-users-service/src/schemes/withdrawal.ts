import Joi, { ObjectSchema } from 'joi';

const withdrawalSchema: ObjectSchema = Joi.object().keys({
  amount: Joi.number().positive().integer().required().messages({
    'number.base': 'Withdrawal amount must be a number',
    'number.positive': 'Withdrawal amount must be greater than zero',
    'number.integer': 'Withdrawal amount must be a whole VND amount',
    'any.required': 'Withdrawal amount is required'
  }),
  bankAccount: Joi.object({
    bankName: Joi.string().trim().max(80).required().messages({
      'string.base': 'Bank name must be of type string',
      'string.empty': 'Bank name is required',
      'string.max': 'Bank name must be 80 characters or fewer',
      'any.required': 'Bank name is required'
    }),
    accountNumber: Joi.string()
      .trim()
      .pattern(/^[0-9]{6,24}$/)
      .required()
      .messages({
        'string.base': 'Account number must be of type string',
        'string.empty': 'Account number is required',
        'string.pattern.base': 'Account number must contain 6 to 24 digits',
        'any.required': 'Account number is required'
      }),
    accountName: Joi.string().trim().max(120).required().messages({
      'string.base': 'Account name must be of type string',
      'string.empty': 'Account name is required',
      'string.max': 'Account name must be 120 characters or fewer',
      'any.required': 'Account name is required'
    })
  })
    .required()
    .messages({
      'any.required': 'Bank account is required'
    })
});

const withdrawalStatusSchema: ObjectSchema = Joi.object().keys({
  status: Joi.string().valid('COMPLETED', 'REJECTED').required().messages({
    'any.only': 'Withdrawal status must be COMPLETED or REJECTED',
    'any.required': 'Withdrawal status is required'
  }),
  adminNote: Joi.string().trim().max(500).allow('').optional().messages({
    'string.max': 'Admin note must be 500 characters or fewer'
  }),
  paymentReference: Joi.string().trim().max(120).allow('').optional().messages({
    'string.max': 'Payment reference must be 120 characters or fewer'
  }),
  processedBy: Joi.object({
    id: Joi.number().optional(),
    username: Joi.string().trim().allow('').optional(),
    email: Joi.string().trim().email().allow('').optional()
  }).optional()
});

export { withdrawalSchema, withdrawalStatusSchema };
