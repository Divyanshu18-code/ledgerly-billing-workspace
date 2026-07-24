import { Router } from 'express';
import { requireAuth } from '../../middlewares/auth.middleware';
import { notificationsController } from './notifications.controller';

const router = Router();

router.use(requireAuth);

router.get('/', notificationsController.getNotifications);
router.patch('/read-all', notificationsController.markAllAsRead);
router.patch('/:id/read', notificationsController.markAsRead);
router.delete('/:id', notificationsController.deleteNotification);

router.get('/preferences', notificationsController.getPreferences);
router.patch('/preferences', notificationsController.updatePreferences);

export default router;
