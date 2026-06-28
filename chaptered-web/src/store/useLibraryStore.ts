import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../lib/bookUtils';
import { compressPDF } from '../lib/pdfUtils';

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  pages: number;
  desc?: string;
  color: string;
  hasPdf: boolean;
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

interface LibraryStore {
  books: Book[];
  sessions: ReadingSession[];

  addBook: (book: Omit<Book, 'id' | 'addedAt'> & { file?: File }) => Promise<void>;
  updateBook: (id: string, patch: Partial<Book> & { file?: File }) => Promise<void>;
  deleteBook: (id: string) => void;
  addSession: (session: { bookId: string; pages: number; note?: string }) => void;
  deleteSession: (id: string) => void;

  getBookProgress: (bookId: string) => number;
  getTotalPagesRead: () => number;
  getStreak: () => number;
  getBooksStats: () => { total: number; completed: number; reading: number; notStarted: number };
  getSessionsForBook: (bookId: string) => ReadingSession[];
  pagesFor: (bookId: string) => number;
  getBookPdfUrl: (bookId: string) => string | null;
}

interface PdfState {
  pdfBlobs: Map<string, string>;
  addPdfBlob: (bookId: string, blobUrl: string) => void;
  removePdfBlob: (bookId: string) => void;
  getExistingPdfBlobUrl: (bookId: string) => string | null;
}

export const usePdfStore = create<PdfState>((set, get) => ({
  pdfBlobs: new Map(),
  addPdfBlob: (bookId, blobUrl) => {
    const current = get().pdfBlobs;
    if (current.has(bookId)) URL.revokeObjectURL(current.get(bookId)!);
    current.set(bookId, blobUrl);
    set({ pdfBlobs: new Map(current) });
  },
  removePdfBlob: (bookId) => {
    const current = get().pdfBlobs;
    if (current.has(bookId)) {
      URL.revokeObjectURL(current.get(bookId)!);
      current.delete(bookId);
      set({ pdfBlobs: new Map(current) });
    }
  },
  getExistingPdfBlobUrl: (bookId) => get().pdfBlobs.get(bookId) || null,
}));

function toast(msg: string, type = '') {
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' ' + type : '');
  el.textContent = msg;
  const c = document.getElementById('tc');
  if (c) { c.appendChild(el); setTimeout(() => el.remove(), 2800); }
}

export const useLibraryStore = create<LibraryStore>()(
  persist(
    (set, get) => ({
      books: [],
      sessions: [],

      addBook: async (input) => {
        const { file, ...rest } = input;
        const id = generateId();
        let hasPdf = false;
        if (file) {
          try {
            const compressed = await compressPDF(file, 'compress-bar', 'compress-label', 'compress-progress');
            const url = URL.createObjectURL(compressed);
            usePdfStore.getState().addPdfBlob(id, url);
            hasPdf = true;
          } catch {
            toast('PDF processing failed. Book added without PDF.', 'err');
          }
        }
        const newBook: Book = {
          ...rest,
          id,
          addedAt: new Date().toISOString(),
          hasPdf,
          pages: Number(rest.pages),
        };
        set((s) => ({ books: [...s.books, newBook] }));
      },

      updateBook: async (id, updates) => {
        const { file, ...patch } = updates;
        let hasPdf = get().books.find((b) => b.id === id)?.hasPdf || false;
        if (file) {
          try {
            const compressed = await compressPDF(file, 'ecompress-bar', 'ecompress-label', 'ecompress-progress');
            const url = URL.createObjectURL(compressed);
            usePdfStore.getState().addPdfBlob(id, url);
            hasPdf = true;
          } catch {
            toast('PDF update failed.', 'err');
          }
        }
        set((s) => ({
          books: s.books.map((b) =>
            b.id === id ? { ...b, ...patch, pages: Number(patch.pages) || b.pages, hasPdf } : b
          ),
        }));
      },

      deleteBook: (id) => {
        set((s) => ({
          books: s.books.filter((b) => b.id !== id),
          sessions: s.sessions.filter((sess) => sess.bookId !== id),
        }));
        usePdfStore.getState().removePdfBlob(id);
      },

      addSession: (input) => {
        const book = get().books.find((b) => b.id === input.bookId);
        if (!book) return;
        const newSession: ReadingSession = {
          id: generateId(),
          bookId: input.bookId,
          pages: input.pages,
          note: input.note || '',
          date: new Date().toISOString().slice(0, 10),
          timestamp: new Date().toISOString(),
        };
        set((s) => ({ sessions: [...s.sessions, newSession] }));
      },

      deleteSession: (id) => {
        set((s) => ({ sessions: s.sessions.filter((sess) => sess.id !== id) }));
      },

      getSessionsForBook: (bookId) =>
        get()
          .sessions.filter((s) => s.bookId === bookId)
          .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),

      pagesFor: (bookId) =>
        get()
          .sessions.filter((s) => s.bookId === bookId)
          .reduce((sum, s) => sum + s.pages, 0),

      getBookProgress: (bookId) => {
        const book = get().books.find((b) => b.id === bookId);
        if (!book || !book.pages) return 0;
        return Math.min(100, Math.round((get().pagesFor(bookId) / book.pages) * 100));
      },

      getTotalPagesRead: () => get().sessions.reduce((sum, s) => sum + s.pages, 0),

      getStreak: () => {
        const ss = get().sessions;
        if (!ss.length) return 0;
        const days = [...new Set(ss.map((s) => s.date))].sort().reverse();
        const t = new Date().toISOString().slice(0, 10);
        const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        if (days[0] !== t && days[0] !== y) return 0;
        let n = 1;
        for (let i = 1; i < days.length; i++) {
          if ((new Date(days[i - 1]).getTime() - new Date(days[i]).getTime()) / 86400000 === 1) n++;
          else break;
        }
        return n;
      },

      getBooksStats: () => {
        const books = get().books;
        let completed = 0, reading = 0, notStarted = 0;
        books.forEach((b) => {
          const p = get().getBookProgress(b.id);
          if (p >= 100) completed++;
          else if (p > 0) reading++;
          else notStarted++;
        });
        return { total: books.length, completed, reading, notStarted };
      },

      getBookPdfUrl: (bookId) => usePdfStore.getState().getExistingPdfBlobUrl(bookId),
    }),
    {
      name: 'chaptered-library-storage',
      partialize: (state) => ({ books: state.books, sessions: state.sessions }),
    }
  )
);
