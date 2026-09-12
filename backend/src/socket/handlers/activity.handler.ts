import { Server, Socket } from 'socket.io';
import { prisma } from '../../config/database';

export function registerActivityHandlers(io: Server, socket: Socket) {
  const user = socket.data.user;

  socket.on('catch-up', async ({ lastSeenAt }: { lastSeenAt: string }) => {
    try {
      const since = new Date(lastSeenAt);

      let where: any = { createdAt: { gt: since } };

      if (user.role === 'PM') {
        where.project = { createdById: user.id };
      } else if (user.role === 'DEVELOPER') {
        where.task = { assignedToId: user.id };
      }

      const missedEvents = await prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'asc' },
        take: 20,
        include: {
          user: { select: { id: true, name: true } },
          task: { select: { id: true, title: true } },
        },
      });

      socket.emit('catch-up:events', missedEvents);
    } catch (err) {
      socket.emit('catch-up:error', { message: 'Failed to fetch missed events' });
    }
  });

  socket.on('join-project', ({ projectId }: { projectId: string }) => {
    socket.join(`project:${projectId}`);
  });

  socket.on('leave-project', ({ projectId }: { projectId: string }) => {
    socket.leave(`project:${projectId}`);
  });
}
