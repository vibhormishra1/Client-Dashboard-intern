import { Request, Response, NextFunction } from 'express';
import * as TaskService from './task.service';
import { successResponse } from '../../utils/response.util';

export async function createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await TaskService.createTask(req.params.projectId as string, req.body, req.user!);
    successResponse(res, { task }, undefined, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateTaskStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await TaskService.updateTaskStatus(req.params.id as string, req.body.status, req.user!);
    successResponse(res, { task });
  } catch (error) {
    next(error);
  }
}

export async function getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const tasks = await TaskService.getTasks(req.user!, req.query as Record<string, string>);
    successResponse(res, { tasks });
  } catch (error) {
    next(error);
  }
}

export async function getTaskById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await TaskService.getTaskById(req.params.id as string, req.user!);
    successResponse(res, { task });
  } catch (error) {
    next(error);
  }
}

export async function updateTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const task = await TaskService.updateTask(req.params.id as string, req.body, req.user!);
    successResponse(res, { task });
  } catch (error) {
    next(error);
  }
}
