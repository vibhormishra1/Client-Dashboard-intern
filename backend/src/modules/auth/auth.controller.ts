import { Request, Response, NextFunction } from 'express';
import { loginUser, refreshAccessToken, logoutUser } from './auth.service';
import { successResponse } from '../../utils/response.util';
import { env } from '../../config/env';

const REFRESH_COOKIE_NAME = 'velozity_refresh_token';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const { accessToken, refreshToken, user } = await loginUser(email, password);

    res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    successResponse(res, { accessToken, user });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawRefreshToken = req.cookies[REFRESH_COOKIE_NAME];
    if (!rawRefreshToken) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No refresh token provided', details: [] } });
      return;
    }

    const { accessToken } = await refreshAccessToken(rawRefreshToken);
    successResponse(res, { accessToken });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const rawRefreshToken = req.cookies[REFRESH_COOKIE_NAME];
    
    await logoutUser(userId, rawRefreshToken);
    
    res.clearCookie(REFRESH_COOKIE_NAME, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    successResponse(res, { message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    successResponse(res, { user: req.user });
  } catch (err) {
    next(err);
  }
}
