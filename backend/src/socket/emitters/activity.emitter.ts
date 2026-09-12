import { io } from '../index';
import { prisma } from '../../config/database';

interface ActivityLogPayload {
  id: string;
  taskId: string;
  projectId: string | null;
  userId: string | null;
  fromStatus: string;
  toStatus: string;
  message: string;
  createdAt: Date;
}

export const activityEmitter = {
  async emit(log: ActivityLogPayload) {
    const task = await prisma.task.findUnique({
      where: { id: log.taskId },
      select: { assignedToId: true },
    });

    const payload = {
      ...log,
      createdAt: log.createdAt.toISOString(),
    };

    io.to('global').emit('activity:new', payload);

    if (log.projectId) {
      io.to(`project:${log.projectId}`).emit('activity:new', payload);
      io.to(`project:${log.projectId}`).emit('task:updated', { taskId: log.taskId, newStatus: log.toStatus });
    }

    if (task?.assignedToId) {
      io.to(`user:${task.assignedToId}`).emit('activity:new', payload);
      io.to(`user:${task.assignedToId}`).emit('task:updated', { taskId: log.taskId, newStatus: log.toStatus });
    }
  }
};
