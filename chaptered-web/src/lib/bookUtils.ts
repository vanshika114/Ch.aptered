import type { ReadingSession } from '../store/useLibraryStore';

export const calculateStreak = (sessions: ReadingSession[]): number => {
  if (!sessions || sessions.length === 0) return 0;
  const uniqueDates = [...new Set(sessions.map(s => s.date))].sort().reverse();
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;
  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const diff = (new Date(uniqueDates[i - 1]).getTime() - new Date(uniqueDates[i]).getTime()) / 86400000;
    if (diff === 1) streak++;
    else break;
  }
  return streak;
};

export const calculateProgress = (pagesRead: number, totalPages: number): number => {
  if (totalPages === 0) return 0;
  return Math.min(100, Math.round((pagesRead / totalPages) * 100));
};

export const formatSessionDate = (dateString: string): string => {
  try {
    return new Date(dateString + 'T12:00:00').toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
    });
  } catch {
    return dateString;
  }
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
};
