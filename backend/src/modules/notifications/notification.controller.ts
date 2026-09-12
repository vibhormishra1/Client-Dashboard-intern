import { Request, Response, NextFunction } from 'express';
import * as NotificationService from './notification.service';
import { successResponse } from '../../utils/response.util';

export async function getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const notifications = await NotificationService.getNotifications(req.user!.id);
    successResponse(res, { notifications });
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const notification = await NotificationService.markAsRead(req.params.id as string, req.user!.id);
    successResponse(res, { notification });
  } catch (error) {
    next(error);
  }
}

export async function markAllAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await NotificationService.markAllAsRead(req.user!.id);
    successResponse(res, { message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
}
