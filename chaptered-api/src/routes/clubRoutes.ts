import { Router } from 'express';
import { auth } from '../middleware/auth';
import { inviteLimiter } from '../middleware/rateLimiter';
import {
  createClub, getClubs, getClubById, joinClub, requestJoin, approveJoin, rejectJoin,
  leaveClub, promoteToAdmin, removeMember, getPendingRequests,
  generateInviteCodeForClub, joinByInviteCode, updateClubBook,
} from '../controllers/clubController';

const router = Router();
router.use(auth);

router.post('/', createClub);
router.get('/', getClubs);
router.get('/:id', getClubById);
router.post('/:id/join', joinClub);
router.post('/:id/request-join', requestJoin);
router.post('/:id/approve-join/:userId', approveJoin);
router.post('/:id/reject-join/:userId', rejectJoin);
router.post('/:id/leave', leaveClub);
router.post('/:id/promote-admin/:userId', promoteToAdmin);
router.post('/:id/remove-member/:userId', removeMember);
router.get('/:id/pending-requests', getPendingRequests);
router.post('/:id/generate-invite', inviteLimiter, generateInviteCodeForClub);
router.post('/join-by-invite', inviteLimiter, joinByInviteCode);
router.patch('/:id/book', updateClubBook);

export default router;
