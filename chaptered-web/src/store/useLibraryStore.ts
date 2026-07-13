import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '../lib/bookUtils';


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

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] || result);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const PDF_ENDPOINT = (id: string) => `/api/books/${id}/pdf`;

function toast(msg: string, type = '') {
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' ' + type : '');
  el.textContent = msg;
  const c = document.getElementById('tc');
  if (c) { c.appendChild(el); setTimeout(() => el.remove(), 2800); }
}

function getToken(): string | null {
  return localStorage.getItem('chaptered-token');
}

async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
}

function mapBackendBook(b: any): Book {
  return {
    id: b._id || b.id,
    title: b.title,
    author: b.author,
    genre: b.genre || 'Fiction',
    pages: b.pages || 0,
    desc: b.desc || '',
    color: b.color || '#8B3A3A',
    hasPdf: b.hasPdf || false,
    addedAt: b.createdAt || b.addedAt || new Date().toISOString(),
  };
}

function mapBackendSession(s: any): ReadingSession {
  return {
    id: s._id || s.id,
    bookId: s.bookId,
    pages: s.pagesRead || s.pages || 0,
    note: s.notes || s.note || '',
    date: s.date || (s.createdAt ? new Date(s.createdAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10)),
    timestamp: s.createdAt || s.timestamp || new Date().toISOString(),
  };
}

export const useLibraryStore = create<LibraryStore>()(
  persist(
    (set, get) => ({
      books: [],
      sessions: [],

      fetchBooks: async () => {
        try {
          const res = await authFetch('/api/books');
          if (res.ok) {
            const data = await res.json();
            const books = (data.books || []).map(mapBackendBook);
            set({ books });
          }
        } catch {
          // fallback to local state
        }
      },

      fetchSessions: async () => {
        try {
          const res = await authFetch('/api/sessions?limit=500');
          if (res.ok) {
            const data = await res.json();
            const sessions = (data.sessions || []).map(mapBackendSession);
            set({ sessions });
          }
        } catch {
          // fallback to local state
        }
      },

      addBook: async (input) => {
        const { file, ...rest } = input;

        try {
          const res = await authFetch('/api/books', {
            method: 'POST',
            body: JSON.stringify({ ...rest, hasPdf: !!file, pages: Number(rest.pages) }),
          });
          if (res.ok) {
            const newBook = await res.json();
            const bookId = newBook._id || newBook.id;
            let pdfOk = false;
            if (file) {
              try {
                const base64 = await fileToBase64(file);
                const pdfRes = await authFetch(PDF_ENDPOINT(bookId), {
                  method: 'POST',
                  body: JSON.stringify({ pdf: base64 }),
                });
                pdfOk = pdfRes.ok;
              } catch {
                toast('PDF upload failed.', 'warn');
              }
            }
            set((s) => ({ books: [...s.books, mapBackendBook({ ...newBook, hasPdf: pdfOk })] }));
            return;
          }
          const errData = await res.json().catch(() => ({}));
          toast(errData.error || errData.errors?.[Object.keys(errData.errors||{})[0]] || `Server error (${res.status})`, 'err');
          return;
        } catch {
          // fallback to local when server unreachable
        }

        const id = generateId();
        const newBook: Book = {
          ...rest,
          id,
          addedAt: new Date().toISOString(),
          hasPdf: !!file,
          pages: Number(rest.pages),
        };
        set((s) => ({ books: [...s.books, newBook] }));
        if (file) {
          try {
            const base64 = await fileToBase64(file);
            await authFetch(PDF_ENDPOINT(id), {
              method: 'POST',
              body: JSON.stringify({ pdf: base64 }),
            });
          } catch {
            toast('PDF saved locally.', 'warn');
          }
        }
      },

      updateBook: async (id, updates) => {
        const { file, ...patch } = updates;
        let hasPdf = get().books.find((b) => b.id === id)?.hasPdf || false;
        if (file) {
          try {
            const base64 = await fileToBase64(file);
            await authFetch(PDF_ENDPOINT(id), {
              method: 'POST',
              body: JSON.stringify({ pdf: base64 }),
            });
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
        try {
          await authFetch(`/api/books/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({ ...patch, pages: Number(patch.pages), hasPdf }),
          });
        } catch {
          // local only
        }
      },

      deleteBook: async (id) => {
        set((s) => ({
          books: s.books.filter((b) => b.id !== id),
          sessions: s.sessions.filter((sess) => sess.bookId !== id),
        }));
        try {
          await authFetch(`/api/books/${id}`, { method: 'DELETE' });
        } catch {
          // local only
        }
      },

      addSession: async (input) => {
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
        try {
          await authFetch('/api/sessions', {
            method: 'POST',
            body: JSON.stringify({
              bookId: input.bookId,
              bookTitle: book.title,
              bookAuthor: book.author,
              pagesRead: input.pages,
              notes: input.note || '',
              status: 'reading',
            }),
          });
        } catch {
          // local only
        }
      },

      deleteSession: async (id) => {
        set((s) => ({ sessions: s.sessions.filter((sess) => sess.id !== id) }));
        try {
          await authFetch(`/api/sessions/${id}`, { method: 'DELETE' });
        } catch {
          // local only
        }
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

      getBookPdfUrl: (bookId) => {
        const book = get().books.find((b) => b.id === bookId);
        return book?.hasPdf ? PDF_ENDPOINT(bookId) : null;
      },
    }),
    {
      name: 'chaptered-library-storage',
      partialize: (state) => ({ books: state.books, sessions: state.sessions }),
    }
  )
);
