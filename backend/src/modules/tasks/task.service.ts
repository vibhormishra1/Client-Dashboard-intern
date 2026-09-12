import { prisma } from '../../config/database';
import { AppError } from '../../utils/response.util';
import { activityEmitter } from '../../socket/emitters/activity.emitter';
import { notificationEmitter } from '../../socket/emitters/notification.emitter';
import { TaskStatus, Role, NotificationType, Prisma } from '@prisma/client';

interface CreateTaskData {
  title: string;
  description?: string;
  assignedToId?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dueDate?: string;
}

interface TaskFilters {
  status?: TaskStatus;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  projectId?: string;
  fromDate?: string;
  toDate?: string;
}

interface RequestingUser {
  id: string;
  role: Role;
}

export async function createTask(
  projectId: string,
  data: CreateTaskData,
  requestingUser: RequestingUser
) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    throw new AppError('NOT_FOUND', 'Project not found', 404);
  }

  if (requestingUser.role === 'PM' && project.createdById !== requestingUser.id) {
    throw new AppError('FORBIDDEN', 'You can only add tasks to your own projects', 403);
  }

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const task = await tx.task.create({
      data: {
        ...data,
        projectId,
        createdById: requestingUser.id,
      },
    });

    let notification = null;
    if (task.assignedToId && task.assignedToId !== requestingUser.id) {
      notification = await tx.notification.create({
        data: {
          recipientId: task.assignedToId,
          message: `You have been assigned to task "${task.title}"`,
          type: NotificationType.TASK_ASSIGNED,
          taskId: task.id,
        },
      });
    }

    return { task, notification };
  });

  if (result.notification) {
    notificationEmitter.emit(result.notification);
  }

  return result.task;
}

export async function updateTaskStatus(
  taskId: string,
  newStatus: TaskStatus,
  requestingUser: RequestingUser
) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: { include: { createdBy: true } } },
  });

  if (!task) {
    throw new AppError('NOT_FOUND', 'Task not found', 404);
  }

  if (requestingUser.role === 'DEVELOPER') {
    if (task.assignedToId !== requestingUser.id) {
      throw new AppError('FORBIDDEN', 'You can only update your own tasks', 403);
    }
  }

  if (requestingUser.role === 'PM') {
    if (task.project.createdById !== requestingUser.id) {
      throw new AppError('FORBIDDEN', 'You can only update tasks in your projects', 403);
    }
  }

  const fromStatus = task.status;
  if (fromStatus === newStatus) {
    throw new AppError('BAD_REQUEST', 'Task is already in this status', 400);
  }

  const activityMessage = `moved task "${task.title}" from ${fromStatus} → ${newStatus}`;

  const result = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const updatedTask = await tx.task.update({
      where: { id: taskId },
      data: { status: newStatus },
    });

    const activityLog = await tx.activityLog.create({
      data: {
        taskId,
        projectId: task.projectId,
        userId: requestingUser.id,
        fromStatus,
        toStatus: newStatus,
        message: activityMessage,
      },
    });

    let notification = null;
    if (newStatus === 'IN_REVIEW' && task.project.createdById) {
      notification = await tx.notification.create({
        data: {
          recipientId: task.project.createdById,
          message: `Task "${task.title}" has been moved to In Review`,
          type: NotificationType.TASK_IN_REVIEW,
          taskId,
        },
      });
    }

    return { updatedTask, activityLog, notification };
  });

  activityEmitter.emit(result.activityLog);

  if (result.notification) {
    notificationEmitter.emit(result.notification);
  }

  return result.updatedTask;
}

export async function getTasks(
  requestingUser: RequestingUser,
  filters: TaskFilters
) {
  const where: Prisma.TaskWhereInput = {};

  if (requestingUser.role === 'DEVELOPER') {
    where.assignedToId = requestingUser.id;
  }

  if (requestingUser.role === 'PM') {
    where.project = { createdById: requestingUser.id };
  }

  if (filters.status) where.status = filters.status;
  if (filters.priority) where.priority = filters.priority;
  if (filters.projectId) where.projectId = filters.projectId;
  if (filters.fromDate || filters.toDate) {
    where.dueDate = {};
    if (filters.fromDate) where.dueDate.gte = new Date(filters.fromDate);
    if (filters.toDate) where.dueDate.lte = new Date(filters.toDate);
  }

  return prisma.task.findMany({
    where,
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
  });
}

export async function getTaskById(taskId: string, requestingUser: RequestingUser) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignedTo: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, name: true, createdById: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  if (!task) {
    throw new AppError('NOT_FOUND', 'Task not found', 404);
  }

  if (requestingUser.role === 'DEVELOPER' && task.assignedToId !== requestingUser.id) {
    throw new AppError('FORBIDDEN', 'You can only access your own tasks', 403);
  }

  if (requestingUser.role === 'PM' && task.project.createdById !== requestingUser.id) {
    throw new AppError('FORBIDDEN', 'You can only access tasks in your projects', 403);
  }

  return task;
}

export async function updateTask(taskId: string, data: Partial<CreateTaskData>, requestingUser: RequestingUser) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { project: true }
  });

  if (!task) {
    throw new AppError('NOT_FOUND', 'Task not found', 404);
  }

  if (requestingUser.role === 'PM' && task.project.createdById !== requestingUser.id) {
    throw new AppError('FORBIDDEN', 'You can only edit tasks in your projects', 403);
  }

  return prisma.task.update({
    where: { id: taskId },
    data,
  });
}
