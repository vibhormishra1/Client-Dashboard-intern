import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { Role } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  role: Role;
  email: string;
}

export function signAccessToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_ACCESS_EXPIRY as string as jwt.SignOptions['expiresIn'],
    issuer: 'velozity-api',
  };
  return jwt.sign({ ...payload }, env.JWT_ACCESS_SECRET, options);
}

export function signRefreshToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: env.JWT_REFRESH_EXPIRY as string as jwt.SignOptions['expiresIn'],
    issuer: 'velozity-api',
  };
  return jwt.sign({ ...payload }, env.JWT_REFRESH_SECRET, options);
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, {
    issuer: 'velozity-api',
  }) as JwtPayload;
}

export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, {
    issuer: 'velozity-api',
  }) as JwtPayload;
}
