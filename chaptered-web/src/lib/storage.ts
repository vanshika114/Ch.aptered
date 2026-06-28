const KEYS = {
  BOOKS: 'chaptered_books_v2',
  SESSIONS: 'chaptered_sessions_v2',
} as const;

export interface Book {
  id: string;
  title: string;
  author?: string;
  genre?: string;
  pages: number;
  desc?: string;
  color?: string;
  hasPdf?: boolean;
  addedAt: string;
}

export interface ReadingSession {
  id: string;
  bookId: string;
  pages: number;
  note?: string;
  date: string;
  timestamp: string;
}

export const storage = {
  getBooks(): Book[] {
    try {
      const json = localStorage.getItem(KEYS.BOOKS);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  },
  saveBooks(books: Book[]): void {
    try { localStorage.setItem(KEYS.BOOKS, JSON.stringify(books)); } catch {}
  },
  addBook(book: Book): void {
    const books = this.getBooks();
    books.push(book);
    this.saveBooks(books);
  },
  updateBook(id: string, updates: Partial<Book>): void {
    const books = this.getBooks().map(b => (b.id === id ? { ...b, ...updates } : b));
    this.saveBooks(books);
  },
  deleteBook(id: string): void {
    this.saveBooks(this.getBooks().filter(b => b.id !== id));
    this.saveSessions(this.getSessions().filter(s => s.bookId !== id));
  },
  getSessions(): ReadingSession[] {
    try {
      const json = localStorage.getItem(KEYS.SESSIONS);
      return json ? JSON.parse(json) : [];
    } catch {
      return [];
    }
  },
  saveSessions(sessions: ReadingSession[]): void {
    try { localStorage.setItem(KEYS.SESSIONS, JSON.stringify(sessions)); } catch {}
  },
  addSession(session: ReadingSession): void {
    const sessions = this.getSessions();
    sessions.push(session);
    this.saveSessions(sessions);
  },
  deleteSession(id: string): void {
    this.saveSessions(this.getSessions().filter(s => s.id !== id));
  },
  getSessionsForBook(bookId: string): ReadingSession[] {
    return this.getSessions().filter(s => s.bookId === bookId);
  },
  getPagesReadForBook(bookId: string): number {
    return this.getSessionsForBook(bookId).reduce((sum, s) => sum + s.pages, 0);
  },
  getTotalPagesRead(): number {
    return this.getSessions().reduce((sum, s) => sum + s.pages, 0);
  },
};
