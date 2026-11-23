import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from './config/env';
import { auctionEngine } from './services/auctionEngine';
import { ManagerPayload } from './middleware/auth';
import { logger } from './utils/logger';

export const setupSocketServer = (httpServer: HttpServer): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: [
        config.clientUrl,
        config.playerRegistrationUrl,
        'http://localhost:5173',
        'http://localhost:5174',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
      ],
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 30000,
    pingInterval: 10000,
  });

  // Attach io to the engine
  auctionEngine.setSocketServer(io);

  io.on('connection', (socket: Socket) => {
    logger.info(`🔌 Socket connected: ${socket.id}`);

    // Join specific auction room
    socket.on('join:auction', async (data: { auctionId: string }) => {
      const auctionId = data?.auctionId || 'auc-2026';
      socket.join(`auction:${auctionId}`);
      logger.info(`📺 Socket ${socket.id} joined room auction:${auctionId}`);

      // Send immediate state snapshot
      try {
        const state = await auctionEngine.getAuctionState(auctionId);
        socket.emit('auction:state', state);
      } catch (err) {
        logger.warn('Failed to send initial socket state:', err);
      }
    });

    // Leave room
    socket.on('leave:auction', (data: { auctionId: string }) => {
      const auctionId = data?.auctionId;
      if (auctionId) {
        socket.leave(`auction:${auctionId}`);
      }
    });

    // Handle real-time Bid submission from Manager
    socket.on(
      'bid:place',
      async (data: { auctionId: string; amount: number; token: string }) => {
        try {
          if (!data || !data.auctionId || !data.amount || !data.token) {
            socket.emit('bid:rejected', {
              message: 'Invalid bid payload. Auction ID, amount, and manager token are required.',
            });
            return;
          }

          // Verify Manager JWT
          let decoded: ManagerPayload;
          try {
            decoded = jwt.verify(data.token, config.jwtSecret) as ManagerPayload;
            if (decoded.role !== 'manager' || !decoded.id) {
              socket.emit('bid:rejected', {
                message: 'Unauthorized: Only team managers can place bids.',
              });
              return;
            }
          } catch {
            socket.emit('bid:rejected', {
              message: 'Authentication failed: Invalid or expired manager token.',
            });
            return;
          }

          // Execute bid through auction engine
          const result = await auctionEngine.placeBid(
            data.auctionId,
            decoded.id,
            Number(data.amount)
          );

          socket.emit('bid:accepted', {
            message: `Bid of $${Number(data.amount).toLocaleString()} accepted!`,
            bid: result.bid,
          });
        } catch (err: any) {
          logger.warn(`Bid rejection for socket ${socket.id}:`, err.message);
          socket.emit('bid:rejected', {
            message: err.message || 'Bid could not be accepted.',
          });
        }
      }
    );

    socket.on('disconnect', () => {
      logger.info(`🔌 Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};
