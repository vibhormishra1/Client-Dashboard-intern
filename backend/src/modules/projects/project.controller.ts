import { Request, Response, NextFunction } from 'express';
import * as ProjectService from './project.service';
import { successResponse } from '../../utils/response.util';

export async function createProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await ProjectService.createProject(req.body, req.user!);
    successResponse(res, { project }, undefined, 201);
  } catch (error) {
    next(error);
  }
}

export async function getProjects(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const projects = await ProjectService.getProjects(req.user!);
    successResponse(res, { projects });
  } catch (error) {
    next(error);
  }
}

export async function getProjectById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await ProjectService.getProjectById(req.params.id as string, req.user!);
    successResponse(res, { project });
  } catch (error) {
    next(error);
  }
}

export async function updateProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const project = await ProjectService.updateProject(req.params.id as string, req.body, req.user!);
    successResponse(res, { project });
  } catch (error) {
    next(error);
  }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await ProjectService.deleteProject(req.params.id as string);
    successResponse(res, { message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
}
