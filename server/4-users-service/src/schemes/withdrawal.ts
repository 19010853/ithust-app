import Joi, { ObjectSchema } from 'joi';

const withdrawalSchema: ObjectSchema = Joi.object().keys({
  amount: Joi.number().positive().integer().required().messages({
    'number.base': 'Withdrawal amount must be a number',
    'number.positive': 'Withdrawal amount must be greater than zero',
    'number.integer': 'Withdrawal amount must be a whole VND amount',
    'any.required': 'Withdrawal amount is required'
  }),
  bankAccount: Joi.any().strip()
});

const withdrawalStatusSchema: ObjectSchema = Joi.object().keys({
  status: Joi.string().valid('COMPLETED', 'REJECTED', 'FAILED', 'MANUAL_REVIEW', 'RECONCILIATION_REQUIRED').required().messages({
    'any.only': 'Withdrawal status must be COMPLETED, REJECTED, FAILED, MANUAL_REVIEW or RECONCILIATION_REQUIRED',
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
