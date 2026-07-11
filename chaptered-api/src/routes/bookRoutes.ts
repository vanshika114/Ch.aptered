import { Router } from 'express';
import { auth } from '../middleware/auth';
import { createBook, getBooks, updateBook, deleteBook, uploadPdf, getPdf } from '../controllers/bookController';

const router = Router();
router.use(auth);

router.post('/', createBook);
router.get('/', getBooks);
router.patch('/:id', updateBook);
router.delete('/:id', deleteBook);
router.post('/:id/pdf', uploadPdf);
router.get('/:id/pdf', getPdf);

export default router;
