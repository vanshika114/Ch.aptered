/**
 * Centralized localStorage management for book tracking
 * Single source of truth for all data persistence
 */

const KEYS = {
  BOOKS: 'chaptered_books_v2',
  SESSIONS: 'chaptered_sessions_v2',
  FILES: 'chaptered_files_v2',
} as const;

// Type definitions
export interface Book {
  id: string;
  title: string;
  author?: string;
  totalPages: number;
  currentPage: number;
  rating?: number;
  notes?: string;
  cover?: string;
  createdAt: string;
}

export interface ReadingSession {
  id: string;
  bookId: string;
  pagesRead: number;
  date: string; // ISO date string
  duration?: number; // minutes
  notes?: string;
}

// Get/Set Books
export const storage = {
  getBooks(): Book[] {
    try {
      return JSON.parse(localStorage.getItem(KEYS.BOOKS) || '[]');
    } catch {
      return [];
    }
  },

  saveBooks(books: Book[]): void {
    localStorage.setItem(KEYS.BOOKS, JSON.stringify(books));
  },

  addBook(book: Book): void {
    const books = this.getBooks();
    books.push(book);
    this.saveBooks(books);
  },

  updateBook(id: string, updates: Partial<Book>): void {
    const books = this.getBooks();
    const updated = books.map(b => b.id === id ? { ...b, ...updates } : b);
    this.saveBooks(updated);
  },

  deleteBook(id: string): void {
    const books = this.getBooks().filter(b => b.id !== id);
    const sessions = this.getSessions().filter(s => s.bookId !== id);
    this.saveBooks(books);
    this.saveSessions(sessions);
  },

  // Get/Set Sessions
  getSessions(): ReadingSession[] {
    try {
      return JSON.parse(localStorage.getItem(KEYS.SESSIONS) || '[]');
    } catch {
      return [];
    }
  },

  saveSessions(sessions: ReadingSession[]): void {
    localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions));
  },

  addSession(session: ReadingSession): void {
    const sessions = this.getSessions();
    sessions.push(session);
    this.saveSessions(sessions);
  },

  deleteSession(id: string): void {
    const sessions = this.getSessions().filter(s => s.id !== id);
    this.saveSessions(sessions);
  },

  // Queries
  getSessionsForBook(bookId: string): ReadingSession[] {
    return this.getSessions().filter(s => s.bookId === bookId);
  },

  getPagesReadForBook(bookId: string): number {
    return this.getSessionsForBook(bookId).reduce((sum, s) => sum + s.pagesRead, 0);
  },

  getTotalPagesRead(): number {
    return this.getSessions().reduce((sum, s) => sum + s.pagesRead, 0);
  },
};

export default storage;