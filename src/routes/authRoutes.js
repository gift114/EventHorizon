const express = require('express');
const router = express.Router();

const { register, login, verifyEmail } = require('../controllers/authController');
const validate = require('../middleware/validate');
const {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
} = require('../validations/authValidation');


router.post('/register', validate(registerSchema), register);
router.get('/verify-email', validate(verifyEmailSchema, 'query'), verifyEmail);
router.post('/login', validate(loginSchema), login);

module.exports = router;