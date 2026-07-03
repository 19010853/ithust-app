import Joi, { ObjectSchema } from 'joi';

const loginSchema: ObjectSchema = Joi.object().keys({
  email: Joi.string().trim().email().required().messages({
    'string.base': 'Email must be of type string',
    'string.email': 'Invalid email',
    'string.empty': 'Email is a required field',
    'any.required': 'Email is a required field'
  }),
  password: Joi.string().min(4).max(12).required().messages({
    'string.base': 'Password must be of type string',
    'string.min': 'Invalid password',
    'string.max': 'Invalid password',
    'string.empty': 'Password is a required field'
  }),
  browserName: Joi.string().optional(),
  deviceType: Joi.string().optional()
});

export { loginSchema };
