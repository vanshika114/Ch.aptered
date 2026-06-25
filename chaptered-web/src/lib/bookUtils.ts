import type { ReadingSession } from './storage';

/**
 * Reading streak: consecutive days with reading sessions
 */
export const calculateStreak = (sessions: ReadingSession[]): number => {
  if (!sessions.length) return 0;

  const uniqueDates = [...new Set(sessions.map(s => s.date))].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // If no reading recorded today or yesterday, streak is broken
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;

  // Count consecutive days backwards
  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const daysDiff = (new Date(uniqueDates[i - 1]).getTime() - new Date(uniqueDates[i]).getTime()) / 86400000;
    if (daysDiff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};

/**
 * Reading progress as percentage
 */
export const calculateProgress = (pagesRead: number, totalPages: number): number => {
  return Math.min(100, Math.round((pagesRead / totalPages) * 100));
};

/**
 * Format date for display (e.g., "3 Jan", "15 Dec")
 */
export const formatSessionDate = (dateString: string): string => {
  return new Date(dateString + 'T12:00:00').toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
};

/**
 * Generate unique ID for new records
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
};