import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import * as NotificationController from './notification.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', NotificationController.getNotifications);
router.patch('/read-all', NotificationController.markAllAsRead);
router.patch('/:id/read', NotificationController.markAsRead);

export default router;
