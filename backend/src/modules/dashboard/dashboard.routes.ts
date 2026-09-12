import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';
import * as DashboardController from './dashboard.controller';

const router = Router();

router.use(authMiddleware);

router.get('/stats', requireRole(['ADMIN']), DashboardController.getAdminStats);
router.get('/pm', requireRole(['PM']), DashboardController.getPmStats);
router.get('/dev', requireRole(['DEVELOPER']), DashboardController.getDevStats);

export default router;
