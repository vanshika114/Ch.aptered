/**
 * Controller handlers for Reading Session API endpoints.
 * Implements CRUD actions, input validations, user authorization check, and pagination.
 */
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ReadingSession } from '../models/ReadingSession';

// POST /api/sessions
export const createSession = async (req: AuthRequest, res: Response): Promise<any> => {
  const { bookId, bookTitle, bookAuthor, bookCoverUrl, startedAt, endedAt, pagesRead, notes, status } = req.body;

  // 1. Validation
  const errors: Record<string, string> = {};
  if (!bookId) errors.bookId = 'bookId is required';
  if (!bookTitle) errors.bookTitle = 'bookTitle is required';

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ errors });
  }

  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 2. Check if active session already exists for same book
    const existingActive = await ReadingSession.findOne({
      userId,
      bookId,
      status: 'reading',
    });

    if (existingActive) {
      return res.status(409).json({ error: 'An active reading session already exists for this book.' });
    }

    // 3. Create session
    const session = new ReadingSession({
      userId,
      bookId,
      bookTitle,
      bookAuthor,
      bookCoverUrl,
      startedAt: startedAt || new Date(),
      endedAt,
      pagesRead: pagesRead || 0,
      notes,
      status: status || 'reading',
    });

    await session.save();
    return res.status(201).json(session);
  } catch (error) {
    console.error('[Create Session Error]:', error);
    return res.status(500).json({ error: 'Server error creating reading session.' });
  }
};

// GET /api/sessions
export const getUserSessions = async (req: AuthRequest, res: Response): Promise<any> => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { status, page, limit } = req.query;

  try {
    const query: any = { userId };
    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    const total = await ReadingSession.countDocuments(query);
    const sessions = await ReadingSession.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return res.json({
      sessions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error('[Get Sessions Error]:', error);
    return res.status(500).json({ error: 'Server error retrieving reading sessions.' });
  }
};

// PATCH /api/sessions/:id
export const updateSession = async (req: AuthRequest, res: Response): Promise<any> => {
  const { id } = req.params;
  const { pagesRead, notes, status, endedAt } = req.body;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const session = await ReadingSession.findById(id);

    if (!session) {
      return res.status(404).json({ error: 'Reading session not found.' });
    }

    // Validate ownership
    if (session.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Forbidden. You do not own this reading session.' });
    }

    // Update fields
    if (pagesRead !== undefined) {
      if (typeof pagesRead !== 'number' || pagesRead < 0) {
        return res.status(400).json({ errors: { pagesRead: 'pagesRead must be a non-negative number' } });
      }
      session.pagesRead = pagesRead;
    }
    if (notes !== undefined) session.notes = notes;
    if (status !== undefined) {
      const allowedStatus = ['reading', 'completed', 'paused', 'abandoned'];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ errors: { status: 'Invalid session status value' } });
      }
      session.status = status;
    }
    if (endedAt !== undefined) session.endedAt = endedAt;

    await session.save();
    return res.json(session);
  } catch (error) {
    console.error('[Update Session Error]:', error);
    return res.status(500).json({ error: 'Server error updating reading session.' });
  }
};

// DELETE /api/sessions/:id
export const deleteSession = async (req: AuthRequest, res: Response): Promise<any> => {
  const { id } = req.params;
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const session = await ReadingSession.findById(id);

    if (!session) {
      return res.status(404).json({ error: 'Reading session not found.' });
    }

    // Validate ownership
    if (session.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Forbidden. You do not own this reading session.' });
    }

    await session.deleteOne();
    return res.json({ message: 'Reading session deleted successfully.' });
  } catch (error) {
    console.error('[Delete Session Error]:', error);
    return res.status(500).json({ error: 'Server error deleting reading session.' });
  }
};
