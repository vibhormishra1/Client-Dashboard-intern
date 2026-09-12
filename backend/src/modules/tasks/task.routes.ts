import { Router } from 'express';
import { validate, validateQuery } from '../../middleware/validate.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { createTaskSchema, updateStatusSchema, taskFilterSchema } from './task.schema';
import * as TaskController from './task.controller';

// Project-scoped tasks: /api/projects/:projectId/tasks
export const projectTaskRouter = Router({ mergeParams: true });
projectTaskRouter.use(authMiddleware);
projectTaskRouter.post('/', requireRole(['ADMIN', 'PM']), validate(createTaskSchema), TaskController.createTask);

// Global tasks: /api/tasks
export const taskRouter = Router();
taskRouter.use(authMiddleware);
taskRouter.get('/', validateQuery(taskFilterSchema), TaskController.getTasks);
taskRouter.get('/:id', TaskController.getTaskById);
taskRouter.patch('/:id/status', requireRole(['ADMIN', 'PM', 'DEVELOPER']), validate(updateStatusSchema), TaskController.updateTaskStatus);
taskRouter.put('/:id', requireRole(['ADMIN', 'PM']), TaskController.updateTask);
