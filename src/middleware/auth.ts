import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { CustomError } from './errorHandler';
import { cache } from '../config/redis';
import { db } from '../config/database';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    companyId?: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new CustomError('Not authorized to access this route', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    // Check if token is blacklisted
    const isBlacklisted = await cache.get(`blacklist:${token}`);
    if (isBlacklisted) {
      throw new CustomError('Token has been invalidated', 401);
    }

    // Get user from database
    const user = await db('users')
      .select('id', 'email', 'role', 'company_id', 'is_active', 'last_login')
      .where('id', decoded.id)
      .first();

    if (!user) {
      throw new CustomError('User not found', 401);
    }

    if (!user.is_active) {
      throw new CustomError('User account is deactivated', 401);
    }

    // Add user to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.company_id
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new CustomError('Invalid token', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new CustomError('Token expired', 401));
    } else {
      next(error);
    }
  }
};

// Role-based authorization middleware
export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new CustomError('Not authorized to access this route', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new CustomError('User role is not authorized to access this route', 403));
      return;
    }

    next();
  };
};

// Company-specific authorization middleware
export const authorizeCompany = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    next(new CustomError('Not authorized to access this route', 401));
    return;
  }

  // Super admins can access all companies
  if (req.user.role === 'super_admin') {
    next();
    return;
  }

  // Check if user has access to the requested company
  const requestedCompanyId = req.params.companyId || req.body.companyId || req.query.companyId;
  
  if (requestedCompanyId && req.user.companyId !== requestedCompanyId) {
    next(new CustomError('Not authorized to access this company\'s data', 403));
    return;
  }

  next();
}; 