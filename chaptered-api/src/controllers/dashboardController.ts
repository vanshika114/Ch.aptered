import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Book } from '../models/Book';
import { ReadingSession } from '../models/ReadingSession';

export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<any> => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const books = await Book.find({ userId });
    const booksCount = books.length;

    const allSessions = await ReadingSession.find({ userId });
    const totalPagesRead = allSessions.reduce((sum: number, s: any) => sum + (s.pagesRead || 0), 0);

    const totalMinutes = allSessions.reduce((sum: number, s: any) => {
      if (s.startedAt && s.endedAt) {
        return sum + Math.round((new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()) / 60000);
      }
      return sum;
    }, 0);

    const dayMap: Record<string, number> = {};
    allSessions.forEach((s: any) => {
      if (s.createdAt) {
        const day = new Date(s.createdAt).toISOString().slice(0, 10);
        dayMap[day] = (dayMap[day] || 0) + (s.pagesRead || 0);
      }
    });

    const dates = Object.keys(dayMap).sort();
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date().toISOString().slice(0, 10);

    for (let i = 0; i < dates.length; i++) {
      if (i > 0) {
        const prev = new Date(dates[i - 1]);
        const curr = new Date(dates[i]);
        const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      longestStreak = Math.max(longestStreak, tempStreak);

      if (dates[i] === today || dates[i] === new Date(Date.now() - 86400000).toISOString().slice(0, 10)) {
        currentStreak = tempStreak;
      }
    }
    if (dates.length === 0) {
      currentStreak = 0;
      longestStreak = 0;
    }

    const now = new Date();
    const heatmap: { date: string; pages: number; level: number }[] = [];
    for (let i = 364; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const pages = dayMap[dateStr] || 0;
      let level = 0;
      if (pages > 0) {
        if (pages <= 10) level = 1;
        else if (pages <= 30) level = 2;
        else if (pages <= 60) level = 3;
        else level = 4;
      }
      heatmap.push({ date: dateStr, pages, level });
    }

    return res.json({
      booksCount,
      totalPagesRead,
      totalMinutes,
      currentStreak,
      longestStreak,
      heatmap,
    });
  } catch (error) {
    console.error('[Dashboard Stats Error]:', error);
    return res.status(500).json({ error: 'Server error fetching dashboard stats.' });
  }
};
