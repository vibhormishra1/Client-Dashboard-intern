import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';

interface RequestingUser {
  id: string;
  role: 'ADMIN' | 'PM' | 'DEVELOPER';
}

export async function getAdminStats() {
  const [totalProjects, totalTasks, totalUsers, onlineUsers, tasksByStatus] = await Promise.all([
    prisma.project.count(),
    prisma.task.count(),
    prisma.user.count(),
    prisma.user.count({ where: { isOnline: true } }),
    prisma.task.groupBy({ by: ['status'], _count: true }),
  ]);

  return {
    totalProjects,
    totalTasks,
    totalUsers,
    onlineUsers,
    tasksByStatus: tasksByStatus.map((g) => ({ status: g.status, count: g._count })),
  };
}

export async function getPmStats(requestingUser: RequestingUser) {
  const where: Prisma.ProjectWhereInput = { createdById: requestingUser.id };

  const [projects, tasks, tasksByStatus] = await Promise.all([
    prisma.project.findMany({
      where,
      select: { id: true, name: true, status: true, _count: { select: { tasks: true } } },
    }),
    prisma.task.count({ where: { project: { createdById: requestingUser.id } } }),
    prisma.task.groupBy({
      by: ['status'],
      where: { project: { createdById: requestingUser.id } },
      _count: true,
    }),
  ]);

  return {
    totalProjects: projects.length,
    totalTasks: tasks,
    projects,
    tasksByStatus: tasksByStatus.map((g) => ({ status: g.status, count: g._count })),
  };
}

export async function getDevStats(requestingUser: RequestingUser) {
  const [tasks, tasksByStatus, overdueTasks] = await Promise.all([
    prisma.task.findMany({
      where: { assignedToId: requestingUser.id },
      include: { project: { select: { id: true, name: true } } },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    }),
    prisma.task.groupBy({
      by: ['status'],
      where: { assignedToId: requestingUser.id },
      _count: true,
    }),
    prisma.task.count({
      where: { assignedToId: requestingUser.id, status: 'OVERDUE' },
    }),
  ]);

  return {
    totalTasks: tasks.length,
    overdueTasks,
    tasks,
    tasksByStatus: tasksByStatus.map((g) => ({ status: g.status, count: g._count })),
  };
}
