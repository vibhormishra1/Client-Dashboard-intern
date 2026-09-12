import crypto from 'crypto';
import { prisma } from '../../config/database';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt.util';
import { AppError } from '../../utils/response.util';
import { comparePassword, hashPassword } from '../../utils/password.util';
import { Role } from '@prisma/client';

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Invalid credentials', 401);
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('UNAUTHORIZED', 'Invalid credentials', 401);
  }

  const payload = { userId: user.id, role: user.role, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await prisma.refreshToken.create({
    data: { token: tokenHash, userId: user.id, expiresAt },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { isOnline: true },
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  };
}

export async function refreshAccessToken(rawRefreshToken: string) {
  const payload = verifyRefreshToken(rawRefreshToken);
  const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: tokenHash },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new AppError('UNAUTHORIZED', 'Invalid or expired refresh token', 401);
  }

  const user = await prisma.user.findUnique({ where: { id: payload.userId } });
  if (!user) {
    throw new AppError('UNAUTHORIZED', 'User no longer exists', 401);
  }

  const newAccessToken = signAccessToken({
    userId: user.id, role: user.role as Role, email: user.email,
  });

  return { accessToken: newAccessToken };
}

export async function logoutUser(userId: string, rawRefreshToken?: string) {
  if (rawRefreshToken) {
    const tokenHash = crypto.createHash('sha256').update(rawRefreshToken).digest('hex');
    await prisma.refreshToken.deleteMany({ where: { token: tokenHash } });
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isOnline: false },
  });
}
