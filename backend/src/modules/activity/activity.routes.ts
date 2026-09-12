import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware';
import * as ActivityController from './activity.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', ActivityController.getActivityFeed);
router.get('/catchup', ActivityController.getMissedEvents);

export default router;
