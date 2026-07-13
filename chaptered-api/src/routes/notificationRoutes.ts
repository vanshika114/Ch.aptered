import { Router } from 'express';
import { auth } from '../middleware/auth';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';

const router = Router();
router.use(auth);

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.post('/read-all', markAllAsRead);

export default router;
