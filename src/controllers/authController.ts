import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';
import { db } from '../config/database';
import { cache } from '../config/redis';
import { emailService } from '../services/emailService';
import { logger } from '../utils/logger';
import { User, CreateUserRequest, LoginRequest, ApiResponse } from '../types';

class AuthController {
  // Register new user
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, firstName, lastName, role, companyId }: CreateUserRequest = req.body;

      // Check if user already exists
      const existingUser = await db('users').where('email', email).first();
      if (existingUser) {
        throw new CustomError('User with this email already exists', 400);
      }

      // Hash password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create user
      const userId = uuidv4();
      const user: Partial<User> = {
        id: userId,
        email,
        firstName,
        lastName,
        role,
        companyId,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await db('users').insert({
        ...user,
        password: hashedPassword
      });

      // Generate verification token
      const verificationToken = uuidv4();
      await cache.set(`email_verification:${verificationToken}`, userId, 24 * 60 * 60); // 24 hours

      // Send verification email
      await emailService.sendVerificationEmail(email, verificationToken, firstName);

      // Generate JWT token
      const token = this.generateToken(userId, email, role);
      const refreshToken = this.generateRefreshToken(userId);

      // Store refresh token
      await cache.set(`refresh_token:${userId}`, refreshToken, 30 * 24 * 60 * 60); // 30 days

      const response: ApiResponse<User> = {
        success: true,
        data: user as User,
        message: 'User registered successfully. Please check your email for verification.'
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Login user
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password, rememberMe }: LoginRequest = req.body;

      // Find user
      const user = await db('users')
        .select('id', 'email', 'firstName', 'lastName', 'role', 'company_id', 'password', 'is_active', 'email_verified')
        .where('email', email)
        .first();

      if (!user) {
        throw new CustomError('Invalid credentials', 401);
      }

      if (!user.is_active) {
        throw new CustomError('Account is deactivated', 401);
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new CustomError('Invalid credentials', 401);
      }

      // Update last login
      await db('users')
        .where('id', user.id)
        .update({ last_login: new Date() });

      // Generate tokens
      const token = this.generateToken(user.id, user.email, user.role);
      const refreshToken = this.generateRefreshToken(user.id);

      // Store refresh token
      const refreshTokenTTL = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 days or 7 days
      await cache.set(`refresh_token:${user.id}`, refreshToken, refreshTokenTTL);

      const response: ApiResponse<{ user: User; token: string; refreshToken: string }> = {
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role,
            companyId: user.company_id,
            isActive: user.is_active,
            lastLogin: user.last_login,
            createdAt: user.created_at,
            updatedAt: user.updated_at
          },
          token,
          refreshToken
        },
        message: 'Login successful'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Logout user
  async logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      const userId = req.user?.id;

      if (token) {
        // Blacklist the token
        await cache.set(`blacklist:${token}`, 'true', 24 * 60 * 60); // 24 hours
      }

      if (userId) {
        // Remove refresh token
        await cache.del(`refresh_token:${userId}`);
      }

      const response: ApiResponse = {
        success: true,
        message: 'Logout successful'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Refresh token
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new CustomError('Refresh token is required', 400);
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
      const userId = decoded.id;

      // Check if refresh token exists in cache
      const storedRefreshToken = await cache.get(`refresh_token:${userId}`);
      if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
        throw new CustomError('Invalid refresh token', 401);
      }

      // Get user
      const user = await db('users')
        .select('id', 'email', 'role', 'is_active')
        .where('id', userId)
        .first();

      if (!user || !user.is_active) {
        throw new CustomError('User not found or inactive', 401);
      }

      // Generate new tokens
      const newToken = this.generateToken(user.id, user.email, user.role);
      const newRefreshToken = this.generateRefreshToken(user.id);

      // Update refresh token in cache
      await cache.set(`refresh_token:${userId}`, newRefreshToken, 30 * 24 * 60 * 60);

      const response: ApiResponse<{ token: string; refreshToken: string }> = {
        success: true,
        data: {
          token: newToken,
          refreshToken: newRefreshToken
        },
        message: 'Token refreshed successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Forgot password
  async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      const user = await db('users').where('email', email).first();
      if (!user) {
        // Don't reveal if user exists or not
        const response: ApiResponse = {
          success: true,
          message: 'If an account with that email exists, a password reset link has been sent.'
        };
        res.status(200).json(response);
        return;
      }

      // Generate reset token
      const resetToken = uuidv4();
      await cache.set(`password_reset:${resetToken}`, user.id, 60 * 60); // 1 hour

      // Send reset email
      await emailService.sendPasswordResetEmail(email, resetToken, user.firstName);

      const response: ApiResponse = {
        success: true,
        message: 'Password reset link sent to your email'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Reset password
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      const { newPassword } = req.body;

      // Get user ID from token
      const userId = await cache.get(`password_reset:${token}`);
      if (!userId) {
        throw new CustomError('Invalid or expired reset token', 400);
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await db('users')
        .where('id', userId)
        .update({ 
          password: hashedPassword,
          updated_at: new Date()
        });

      // Remove reset token
      await cache.del(`password_reset:${token}`);

      // Invalidate all refresh tokens
      await cache.del(`refresh_token:${userId}`);

      const response: ApiResponse = {
        success: true,
        message: 'Password reset successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Change password
  async changePassword(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      // Get user
      const user = await db('users')
        .select('password')
        .where('id', userId)
        .first();

      if (!user) {
        throw new CustomError('User not found', 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new CustomError('Current password is incorrect', 400);
      }

      // Hash new password
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await db('users')
        .where('id', userId)
        .update({ 
          password: hashedPassword,
          updated_at: new Date()
        });

      // Invalidate all refresh tokens
      await cache.del(`refresh_token:${userId}`);

      const response: ApiResponse = {
        success: true,
        message: 'Password changed successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Verify email
  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;

      const userId = await cache.get(`email_verification:${token}`);
      if (!userId) {
        throw new CustomError('Invalid or expired verification token', 400);
      }

      // Update user
      await db('users')
        .where('id', userId)
        .update({ 
          email_verified: true,
          updated_at: new Date()
        });

      // Remove verification token
      await cache.del(`email_verification:${token}`);

      const response: ApiResponse = {
        success: true,
        message: 'Email verified successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Resend verification email
  async resendVerification(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const user = await db('users')
        .select('email', 'firstName', 'email_verified')
        .where('id', userId)
        .first();

      if (!user) {
        throw new CustomError('User not found', 404);
      }

      if (user.email_verified) {
        throw new CustomError('Email is already verified', 400);
      }

      // Generate new verification token
      const verificationToken = uuidv4();
      await cache.set(`email_verification:${verificationToken}`, userId, 24 * 60 * 60);

      // Send verification email
      await emailService.sendVerificationEmail(user.email, verificationToken, user.firstName);

      const response: ApiResponse = {
        success: true,
        message: 'Verification email sent successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Get current user
  async getCurrentUser(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const user = await db('users')
        .select('id', 'email', 'firstName', 'lastName', 'role', 'company_id', 'is_active', 'last_login', 'email_verified', 'created_at', 'updated_at')
        .where('id', userId)
        .first();

      if (!user) {
        throw new CustomError('User not found', 404);
      }

      const response: ApiResponse<User> = {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          companyId: user.company_id,
          isActive: user.is_active,
          lastLogin: user.last_login,
          createdAt: user.created_at,
          updatedAt: user.updated_at
        }
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // Update profile
  async updateProfile(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { firstName, lastName } = req.body;

      if (!userId) {
        throw new CustomError('User not authenticated', 401);
      }

      const updateData: any = { updated_at: new Date() };
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;

      await db('users')
        .where('id', userId)
        .update(updateData);

      const response: ApiResponse = {
        success: true,
        message: 'Profile updated successfully'
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // OAuth methods (placeholder implementations)
  async googleAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    // Implementation for Google OAuth
    res.status(501).json({ message: 'Google OAuth not implemented yet' });
  }

  async googleCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    // Implementation for Google OAuth callback
    res.status(501).json({ message: 'Google OAuth callback not implemented yet' });
  }

  async linkedinAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    // Implementation for LinkedIn OAuth
    res.status(501).json({ message: 'LinkedIn OAuth not implemented yet' });
  }

  async linkedinCallback(req: Request, res: Response, next: NextFunction): Promise<void> {
    // Implementation for LinkedIn OAuth callback
    res.status(501).json({ message: 'LinkedIn OAuth callback not implemented yet' });
  }

  // Helper methods
  private generateToken(userId: string, email: string, role: string): string {
    return jwt.sign(
      { id: userId, email, role },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  private generateRefreshToken(userId: string): string {
    return jwt.sign(
      { id: userId },
      process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret',
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );
  }
}

export const authController = new AuthController(); 