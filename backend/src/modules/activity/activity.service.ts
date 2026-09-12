import { prisma } from '../../config/database';
import { Prisma } from '@prisma/client';

interface RequestingUser {
  id: string;
  role: 'ADMIN' | 'PM' | 'DEVELOPER';
}

export async function getActivityFeed(
  requestingUser: RequestingUser,
  page: number = 1,
  limit: number = 20
) {
  const where: Prisma.ActivityLogWhereInput = {};

  if (requestingUser.role === 'PM') {
    where.project = { createdById: requestingUser.id };
  }

  if (requestingUser.role === 'DEVELOPER') {
    where.task = { assignedToId: requestingUser.id };
  }

  const skip = (page - 1) * limit;

  const [events, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    }),
    prisma.activityLog.count({ where }),
  ]);

  return { events, total };
}

export async function getMissedEvents(
  requestingUser: RequestingUser,
  since: Date,
  limit: number = 20
) {
  const where: Prisma.ActivityLogWhereInput = { createdAt: { gt: since } };

  if (requestingUser.role === 'PM') {
    where.project = { createdById: requestingUser.id };
  }

  if (requestingUser.role === 'DEVELOPER') {
    where.task = { assignedToId: requestingUser.id };
  }

  return prisma.activityLog.findMany({
    where,
    orderBy: { createdAt: 'asc' },
    take: limit,
    include: {
      user: { select: { id: true, name: true } },
      task: { select: { id: true, title: true } },
    },
  });
}
