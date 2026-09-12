import { prisma } from '../../config/database';
import { AppError } from '../../utils/response.util';
import { hashPassword } from '../../utils/password.util';
import { Role } from '@prisma/client';

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: Role;
}

interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
}

export async function getUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isOnline: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createUser(data: CreateUserData) {
  const existingUser = await prisma.user.findUnique({ where: { email: data.email } });

  if (existingUser) {
    throw new AppError('CONFLICT', 'Email already in use', 409);
  }

  const hashedPassword = await hashPassword(data.password);

  return prisma.user.create({
    data: {
      ...data,
      password: hashedPassword,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    }
  });
}

export async function updateUser(userId: string, data: UpdateUserData) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError('NOT_FOUND', 'User not found', 404);
  }

  const updateData = { ...data };
  if (updateData.password) {
    updateData.password = await hashPassword(updateData.password);
  }

  return prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: { id: true, name: true, email: true, role: true }
  });
}

export async function deleteUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError('NOT_FOUND', 'User not found', 404);
  }

  await prisma.user.delete({
    where: { id: userId }
  });
}
