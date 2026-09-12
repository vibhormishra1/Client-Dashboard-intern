import { Request, Response, NextFunction } from 'express';
import * as UserService from './user.service';
import { successResponse } from '../../utils/response.util';

export async function getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await UserService.getUsers();
    successResponse(res, { users });
  } catch (error) {
    next(error);
  }
}

export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await UserService.createUser(req.body);
    successResponse(res, { user }, undefined, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await UserService.updateUser(req.params.id as string, req.body);
    successResponse(res, { user });
  } catch (error) {
    next(error);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await UserService.deleteUser(req.params.id as string);
    successResponse(res, { message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
}
