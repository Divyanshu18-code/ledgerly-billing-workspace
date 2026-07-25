import { Router } from 'express';
import { authController } from './auth.controller';
import { validateBody } from '~/middlewares/validation.middleware';
import { loginLimiter, registerLimiter } from '~/middlewares/rateLimit.middleware';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  workspaceName: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

const verify2FASchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  otpCode: z.string().length(6, 'OTP code must be 6 digits'),
});

router.post('/register', registerLimiter, validateBody(registerSchema), authController.register);
router.post('/login', loginLimiter, validateBody(loginSchema), authController.login);
router.post('/verify-2fa', validateBody(verify2FASchema), authController.verify2FA);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/verify-email', authController.verifyEmail);
router.post('/resend-verification', validateBody(resendVerificationSchema), authController.resendVerification);
router.post('/forgot-password', validateBody(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), authController.resetPassword);
router.post('/google-simulated', authController.googleSimulated);

export default router;
