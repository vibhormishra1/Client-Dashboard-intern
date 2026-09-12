import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  assignedToId: z.string().uuid().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  dueDate: z.string().datetime().optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['TO_DO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'OVERDUE']),
});

export const taskFilterSchema = z.object({
  status: z.enum(['TO_DO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'OVERDUE']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  projectId: z.string().uuid().optional(),
});
