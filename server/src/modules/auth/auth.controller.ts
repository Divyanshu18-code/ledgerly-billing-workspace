import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, firstName, lastName, workspaceName } = req.body;
      
      const result = await authService.register({
        email,
        password,
        firstName,
        lastName,
        workspaceName,
      });

      res.status(201).json({
        status: 'success',
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body;
      
      const result = await authService.login({ email, password });

      res.status(200).json({
        status: 'success',
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;
      const resetToken = await authService.forgotPassword(email);

      res.status(200).json({
        status: 'success',
        message: 'Password reset link sent (simulated)',
        data: { resetToken }, // Return token in testing so they don't need real mail configuration to proceed
      });
    } catch (error) {
      next(error);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;
      await authService.resetPassword(token, password);

      res.status(200).json({
        status: 'success',
        message: 'Password has been reset successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();
