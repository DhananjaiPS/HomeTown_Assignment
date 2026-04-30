const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { signupSchema, loginSchema } = require('../validators/auth.validator');
const { protect } = require('../middlewares/auth.middleware');

router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', protect, authController.getMe);
router.put('/me', protect, authController.updateMe);
router.post('/logout', authController.logout);

module.exports = router;
