import { prisma } from '../../config/database';
import { AppError } from '../../utils/response.util';
import { Prisma, Role } from '@prisma/client';

interface CreateProjectData {
  name: string;
  description?: string;
  clientId?: string;
}

interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: 'ACTIVE' | 'COMPLETED' | 'ON_HOLD';
}

interface RequestingUser {
  id: string;
  role: Role;
}

export async function createProject(data: CreateProjectData, requestingUser: RequestingUser) {
  return prisma.project.create({
    data: {
      ...data,
      createdById: requestingUser.id,
    },
  });
}

export async function getProjects(requestingUser: RequestingUser) {
  const where: Prisma.ProjectWhereInput = {};

  if (requestingUser.role === 'PM') {
    where.createdById = requestingUser.id;
  }

  return prisma.project.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      client: { select: { id: true, name: true } },
      createdBy: { select: { id: true, name: true } },
      _count: { select: { tasks: true } },
    }
  });
}

export async function getProjectById(projectId: string, requestingUser: RequestingUser) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      client: true,
      createdBy: { select: { id: true, name: true, email: true } },
      tasks: {
        include: { assignedTo: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!project) {
    throw new AppError('NOT_FOUND', 'Project not found', 404);
  }

  if (requestingUser.role === 'PM' && project.createdById !== requestingUser.id) {
    throw new AppError('FORBIDDEN', 'You can only access your own projects', 403);
  }

  return project;
}

export async function updateProject(projectId: string, data: UpdateProjectData, requestingUser: RequestingUser) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    throw new AppError('NOT_FOUND', 'Project not found', 404);
  }

  if (requestingUser.role === 'PM' && project.createdById !== requestingUser.id) {
    throw new AppError('FORBIDDEN', 'You can only update your own projects', 403);
  }

  return prisma.project.update({
    where: { id: projectId },
    data,
  });
}

export async function deleteProject(projectId: string) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    throw new AppError('NOT_FOUND', 'Project not found', 404);
  }

  await prisma.project.delete({
    where: { id: projectId },
  });
}
