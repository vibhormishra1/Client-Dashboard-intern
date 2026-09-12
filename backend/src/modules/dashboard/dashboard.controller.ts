import { Request, Response, NextFunction } from 'express';
import * as DashboardService from './dashboard.service';
import { successResponse } from '../../utils/response.util';

export async function getAdminStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await DashboardService.getAdminStats();
    successResponse(res, stats);
  } catch (error) {
    next(error);
  }
}

export async function getPmStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await DashboardService.getPmStats(req.user!);
    successResponse(res, stats);
  } catch (error) {
    next(error);
  }
}

export async function getDevStats(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stats = await DashboardService.getDevStats(req.user!);
    successResponse(res, stats);
  } catch (error) {
    next(error);
  }
}
