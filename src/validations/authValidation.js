const Joi = require('joi');

const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]{8,}$/;

const passwordSchema = Joi.string()
  .pattern(passwordPattern)
  .required()
  .messages({
    'string.pattern.base':
      'Password must be at least 8 characters long and contain both letters and numbers.',
    'string.empty': 'Password is required.',
    'any.required': 'Password is required.',
  });


const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required().messages({
    'string.empty': 'Name is required.',
    'any.required': 'Name is required.',
  }),
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.email': 'A valid email address is required.',
    'string.empty': 'Email is required.',
    'any.required': 'Email is required.',
  }),
  password: passwordSchema,
});

const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.email': 'A valid email address is required.',
    'string.empty': 'Email is required.',
    'any.required': 'Email is required.',
  }),
  password: Joi.string().required().messages({
    'string.empty': 'Password is required.',
    'any.required': 'Password is required.',
  }),
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().required().messages({
    'string.empty': 'Verification token is required.',
    'any.required': 'Verification token is required.',
  }),
});

module.exports = { registerSchema, loginSchema, verifyEmailSchema };
