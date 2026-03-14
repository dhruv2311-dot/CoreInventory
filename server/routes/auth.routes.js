import express from 'express';
import {
	signup,
	login,
	resetPassword,
	requestPasswordResetOtp,
	confirmPasswordResetOtp,
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/reset-password', resetPassword);
router.post('/reset-password/request', requestPasswordResetOtp);
router.post('/reset-password/confirm', confirmPasswordResetOtp);

export default router;
