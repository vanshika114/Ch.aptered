import { Router } from 'express';
import { auth } from '../middleware/auth';
import { voteLimiter } from '../middleware/rateLimiter';
import { castVote, getVotes, getUserVote } from '../controllers/voteController';

const router = Router();
router.use(auth);

router.post('/:clubId', voteLimiter, castVote);
router.get('/:clubId', getVotes);
router.get('/:clubId/me', getUserVote);

export default router;
