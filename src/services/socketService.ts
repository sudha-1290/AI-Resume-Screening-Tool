import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { cache } from '../config/redis';
import { db } from '../config/database';
import { ScreeningProgress } from '../types';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  companyId?: string;
  userRole?: string;
}

export function setupSocketHandlers(io: Server): void {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      // Verify token (simplified - in production, use proper JWT verification)
      const userId = await cache.get(`socket_auth:${token}`);
      if (!userId) {
        return next(new Error('Authentication error: Invalid token'));
      }

      // Get user info
      const user = await db('users')
        .select('id', 'company_id', 'role')
        .where('id', userId)
        .first();

      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user.id;
      socket.companyId = user.company_id;
      socket.userRole = user.role;

      next();
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`User connected: ${socket.userId} (${socket.userRole})`);

    // Join company room for company-specific updates
    if (socket.companyId) {
      socket.join(`company:${socket.companyId}`);
      logger.info(`User ${socket.userId} joined company room: ${socket.companyId}`);
    }

    // Join user-specific room
    socket.join(`user:${socket.userId}`);

    // Handle resume upload progress
    socket.on('resume:upload:progress', async (data: { resumeId: string; progress: number }) => {
      try {
        // Update progress in cache
        await cache.set(`resume_progress:${data.resumeId}`, JSON.stringify({
          progress: data.progress,
          timestamp: new Date().toISOString()
        }), 3600); // 1 hour TTL

        // Emit to user
        socket.emit('resume:upload:progress:update', data);
      } catch (error) {
        logger.error('Error handling resume upload progress:', error);
      }
    });

    // Handle screening progress
    socket.on('screening:progress', async (data: ScreeningProgress) => {
      try {
        // Update progress in cache
        await cache.set(`screening_progress:${data.screeningId}`, JSON.stringify({
          ...data,
          timestamp: new Date().toISOString()
        }), 3600); // 1 hour TTL

        // Emit to user
        socket.emit('screening:progress:update', data);

        // If screening is complete, emit to company room
        if (data.progress === 100) {
          io.to(`company:${socket.companyId}`).emit('screening:completed', {
            screeningId: data.screeningId,
            message: data.message
          });
        }
      } catch (error) {
        logger.error('Error handling screening progress:', error);
      }
    });

    // Handle real-time collaboration
    socket.on('screening:comment:add', async (data: {
      screeningId: string;
      comment: string;
      rating?: number;
    }) => {
      try {
        // Save comment to database
        const commentId = await db('reviewer_notes').insert({
          id: require('uuid').v4(),
          screening_id: data.screeningId,
          reviewer_id: socket.userId,
          note: data.comment,
          rating: data.rating,
          created_at: new Date()
        });

        // Get reviewer info
        const reviewer = await db('users')
          .select('firstName', 'lastName')
          .where('id', socket.userId)
          .first();

        const commentData = {
          id: commentId[0],
          screeningId: data.screeningId,
          reviewerId: socket.userId,
          reviewerName: `${reviewer.firstName} ${reviewer.lastName}`,
          comment: data.comment,
          rating: data.rating,
          createdAt: new Date()
        };

        // Emit to company room
        io.to(`company:${socket.companyId}`).emit('screening:comment:added', commentData);
      } catch (error) {
        logger.error('Error adding screening comment:', error);
      }
    });

    // Handle video screening events
    socket.on('video:screening:join', async (data: { screeningId: string }) => {
      try {
        // Join video screening room
        socket.join(`video_screening:${data.screeningId}`);
        
        // Notify other participants
        socket.to(`video_screening:${data.screeningId}`).emit('video:screening:participant:joined', {
          userId: socket.userId,
          timestamp: new Date().toISOString()
        });

        logger.info(`User ${socket.userId} joined video screening: ${data.screeningId}`);
      } catch (error) {
        logger.error('Error joining video screening:', error);
      }
    });

    socket.on('video:screening:leave', async (data: { screeningId: string }) => {
      try {
        // Leave video screening room
        socket.leave(`video_screening:${data.screeningId}`);
        
        // Notify other participants
        socket.to(`video_screening:${data.screeningId}`).emit('video:screening:participant:left', {
          userId: socket.userId,
          timestamp: new Date().toISOString()
        });

        logger.info(`User ${socket.userId} left video screening: ${data.screeningId}`);
      } catch (error) {
        logger.error('Error leaving video screening:', error);
      }
    });

    // Handle real-time notifications
    socket.on('notification:subscribe', async (data: { types: string[] }) => {
      try {
        // Subscribe to notification types
        data.types.forEach(type => {
          socket.join(`notification:${type}:${socket.companyId}`);
        });

        logger.info(`User ${socket.userId} subscribed to notifications: ${data.types.join(', ')}`);
      } catch (error) {
        logger.error('Error subscribing to notifications:', error);
      }
    });

    // Handle analytics updates
    socket.on('analytics:subscribe', async (data: { types: string[] }) => {
      try {
        // Subscribe to analytics updates
        data.types.forEach(type => {
          socket.join(`analytics:${type}:${socket.companyId}`);
        });

        logger.info(`User ${socket.userId} subscribed to analytics: ${data.types.join(', ')}`);
      } catch (error) {
        logger.error('Error subscribing to analytics:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.userId}`);
    });
  });

  // Set up periodic tasks
  setupPeriodicTasks(io);
}

// Set up periodic tasks for real-time updates
function setupPeriodicTasks(io: Server): void {
  // Update screening progress every 5 seconds
  setInterval(async () => {
    try {
      // Get all active screenings
      const activeScreenings = await db('screenings')
        .select('id', 'status', 'created_at')
        .where('status', 'in_progress')
        .where('created_at', '>', new Date(Date.now() - 24 * 60 * 60 * 1000)); // Last 24 hours

      for (const screening of activeScreenings) {
        // Simulate progress update (in real implementation, this would come from actual processing)
        const progress = Math.min(90, Math.floor((Date.now() - screening.created_at.getTime()) / 1000 / 60)); // 1% per minute
        
        if (progress > 0) {
          io.emit('screening:progress:update', {
            screeningId: screening.id,
            progress,
            status: 'Processing...',
            message: `Analyzing candidate profile... ${progress}% complete`
          });
        }
      }
    } catch (error) {
      logger.error('Error in periodic screening progress update:', error);
    }
  }, 5000);

  // Send system health updates every 30 seconds
  setInterval(async () => {
    try {
      const healthData = {
        timestamp: new Date().toISOString(),
        activeConnections: io.engine.clientsCount,
        memoryUsage: process.memoryUsage(),
        uptime: process.uptime()
      };

      io.emit('system:health', healthData);
    } catch (error) {
      logger.error('Error sending system health update:', error);
    }
  }, 30000);
}

// Utility functions for emitting events
export const socketUtils = {
  // Emit notification to specific user
  async emitToUser(userId: string, event: string, data: any): Promise<void> {
    try {
      const io = require('../index').io; // Get io instance
      io.to(`user:${userId}`).emit(event, data);
    } catch (error) {
      logger.error(`Error emitting to user ${userId}:`, error);
    }
  },

  // Emit notification to company
  async emitToCompany(companyId: string, event: string, data: any): Promise<void> {
    try {
      const io = require('../index').io; // Get io instance
      io.to(`company:${companyId}`).emit(event, data);
    } catch (error) {
      logger.error(`Error emitting to company ${companyId}:`, error);
    }
  },

  // Emit notification to all users
  async emitToAll(event: string, data: any): Promise<void> {
    try {
      const io = require('../index').io; // Get io instance
      io.emit(event, data);
    } catch (error) {
      logger.error('Error emitting to all users:', error);
    }
  },

  // Get active connections count
  async getActiveConnections(): Promise<number> {
    try {
      const io = require('../index').io; // Get io instance
      return io.engine.clientsCount;
    } catch (error) {
      logger.error('Error getting active connections:', error);
      return 0;
    }
  }
}; 