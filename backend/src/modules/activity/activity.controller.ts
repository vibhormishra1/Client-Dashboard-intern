import { Request, Response, NextFunction } from 'express';
import * as ActivityService from './activity.service';
import { successResponse } from '../../utils/response.util';

export async function getActivityFeed(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const { events, total } = await ActivityService.getActivityFeed(req.user!, page, limit);
    
    successResponse(res, { events }, { page, limit, total });
  } catch (error) {
    next(error);
  }
}

export async function getMissedEvents(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const since = req.query.since ? new Date(req.query.since as string) : new Date(Date.now() - 24 * 60 * 60 * 1000);
    const limit = parseInt(req.query.limit as string) || 20;

    const events = await ActivityService.getMissedEvents(req.user!, since, limit);
    
    successResponse(res, { events });
  } catch (error) {
    next(error);
  }
}
