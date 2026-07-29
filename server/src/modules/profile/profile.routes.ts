import { Router } from 'express';
import { profileController } from './profile.controller';
import { requireAuth } from '~/middlewares/auth.middleware';

const router = Router();

// All profile endpoints require authentication
router.use(requireAuth);

router.get('/', profileController.getProfile.bind(profileController));
router.put('/', profileController.updateProfile.bind(profileController));

router.post('/avatar', profileController.uploadAvatar.bind(profileController));
router.delete('/avatar', profileController.removeAvatar.bind(profileController));

router.put('/password', profileController.changePassword.bind(profileController));

router.get('/sessions', profileController.getSessions.bind(profileController));
router.delete('/sessions/:id', profileController.logoutSession.bind(profileController));
router.delete('/sessions', profileController.logoutAllSessions.bind(profileController));

router.get('/login-history', profileController.getLoginHistory.bind(profileController));

router.put('/preferences', profileController.updatePreferences.bind(profileController));
router.put('/privacy', profileController.updatePrivacy.bind(profileController));
router.put('/theme', profileController.updateTheme.bind(profileController));

router.post('/export', profileController.exportAccount.bind(profileController));
router.delete('/', profileController.deleteAccount.bind(profileController));

export default router;
