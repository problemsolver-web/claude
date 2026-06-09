import { Server as HttpServer } from 'http';
import { Server as SocketServer, Socket } from 'socket.io';
import { env } from '../config/env';
import { logger } from '../config/logger';
import { verifyAccessToken } from '../services/token.service';

let io: SocketServer | null = null;

/**
 * Initialize Socket.io on top of the HTTP server. Each authenticated client
 * joins a private room named after their user id so we can target events
 * (notifications, messages) to a specific user.
 */
export function initSocket(httpServer: HttpServer): SocketServer {
  io = new SocketServer(httpServer, {
    cors: { origin: env.CLIENT_URL, credentials: true },
  });

  // JWT auth handshake: client connects with auth.token = access token.
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error('Missing auth token'));
    try {
      const payload = verifyAccessToken(token);
      socket.data.userId = payload.sub;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId as string;
    void socket.join(`user:${userId}`);
    logger.debug({ userId }, 'socket connected');

    socket.on('disconnect', () => logger.debug({ userId }, 'socket disconnected'));
  });

  return io;
}

/** Emit an event to a specific user's room (no-op if sockets aren't ready). */
export function emitToUser(userId: string, event: string, payload: unknown): void {
  io?.to(`user:${userId}`).emit(event, payload);
}
