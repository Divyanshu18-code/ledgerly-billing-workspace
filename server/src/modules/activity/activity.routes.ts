import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { activityController } from './activity.controller';

const router = Router();

router.use(requireAuth);

router.get('/', activityController.getActivityLogs);

export default router;
