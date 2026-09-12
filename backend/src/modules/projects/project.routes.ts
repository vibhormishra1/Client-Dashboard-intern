import { Router } from 'express';
import { validate } from '../../middleware/validate.middleware';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import { createProjectSchema, updateProjectSchema } from './project.schema';
import * as ProjectController from './project.controller';

const router = Router();

router.use(authMiddleware);

router.post('/', requireRole(['ADMIN', 'PM']), validate(createProjectSchema), ProjectController.createProject);
router.get('/', requireRole(['ADMIN', 'PM']), ProjectController.getProjects);
router.get('/:id', requireRole(['ADMIN', 'PM']), ProjectController.getProjectById);
router.put('/:id', requireRole(['ADMIN', 'PM']), validate(updateProjectSchema), ProjectController.updateProject);
router.delete('/:id', requireRole(['ADMIN']), ProjectController.deleteProject);

export default router;
