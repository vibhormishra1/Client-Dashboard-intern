import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import * as UserController from './user.controller';

const router = Router();

router.use(authMiddleware, requireRole(['ADMIN']));

router.get('/', UserController.getUsers);
router.post('/', UserController.createUser);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);

export default router;
