import { Server, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyAccessToken } from '../utils/jwt.util';
import { prisma } from '../config/database';
import { registerActivityHandlers } from './handlers/activity.handler';
import { env } from '../config/env';

export let io: Server;

export function initializeSocket(httpServer: HTTPServer): Server {
  const allowedOrigins = [
    env.CLIENT_URL?.replace(/\/$/, ''),
    'https://velozity-dashboard-pi.vercel.app',
    'http://localhost:5173',
    'http://localhost:5001',
  ].filter(Boolean);

  io = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token as string | undefined;
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const payload = verifyAccessToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, name: true, role: true, email: true },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.data.user = user;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', async (socket: Socket) => {
    const user = socket.data.user;
    console.log(`✅ Socket connected: ${user.name} (${user.role})`);

    await autoJoinRooms(socket, user);
    registerActivityHandlers(io, socket);

    socket.on('disconnect', async () => {
      console.log(`❌ Socket disconnected: ${user.name}`);
      await prisma.user.update({
        where: { id: user.id },
        data: { isOnline: false },
      });
      const onlineCount = await prisma.user.count({ where: { isOnline: true } });
      io.to('global').emit('presence:update', { onlineCount });
    });
  });

  return io;
}

async function autoJoinRooms(socket: Socket, user: { id: string; role: string }) {
  if (user.role === 'ADMIN') {
    socket.join('global');
    const allProjects = await prisma.project.findMany({ select: { id: true } });
    allProjects.forEach((p: { id: string }) => socket.join(`project:${p.id}`));
  }

  if (user.role === 'PM') {
    socket.join(`user:${user.id}`);
    const myProjects = await prisma.project.findMany({
      where: { createdById: user.id },
      select: { id: true },
    });
    myProjects.forEach((p: { id: string }) => socket.join(`project:${p.id}`));
  }

  if (user.role === 'DEVELOPER') {
    socket.join(`user:${user.id}`);
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { isOnline: true },
  });

  const onlineCount = await prisma.user.count({ where: { isOnline: true } });
  socket.to('global').emit('presence:update', { onlineCount });
}
