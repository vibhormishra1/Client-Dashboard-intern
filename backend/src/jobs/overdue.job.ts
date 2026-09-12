import cron from 'node-cron';
import { prisma } from '../config/database';
import { io } from '../socket';

export function startOverdueJob() {
  cron.schedule('0 * * * *', async () => {
    console.log(`[${new Date().toISOString()}] Running overdue task check...`);

    try {
      const updated = await prisma.task.updateMany({
        where: {
          dueDate: { lt: new Date() },
          status: { notIn: ['DONE', 'OVERDUE'] },
        },
        data: { status: 'OVERDUE' },
      });

      if (updated.count > 0) {
        console.log(`Marked ${updated.count} tasks as OVERDUE`);

        const overdueTasks = await prisma.task.findMany({
          where: {
            dueDate: { lt: new Date() },
            status: 'OVERDUE',
            updatedAt: { gte: new Date(Date.now() - 5 * 60 * 1000) },
          },
          select: { id: true, projectId: true, assignedToId: true },
        });

        overdueTasks.forEach(task => {
          io.to('global').emit('task:updated', { taskId: task.id, newStatus: 'OVERDUE' });
          io.to(`project:${task.projectId}`).emit('task:updated', { taskId: task.id, newStatus: 'OVERDUE' });
          if (task.assignedToId) {
            io.to(`user:${task.assignedToId}`).emit('task:updated', { taskId: task.id, newStatus: 'OVERDUE' });
          }
        });
      }
    } catch (err) {
      console.error('Overdue job failed:', err);
    }
  });

  console.log('✅ Overdue task job scheduled (every hour)');
}
