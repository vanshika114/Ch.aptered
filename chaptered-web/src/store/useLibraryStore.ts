import { create } from 'zustand';

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  pages: number;
  desc?: string;
  color: string;
  hasPdf: boolean;
}

export interface Session {
  id: string;
  bookId: string;
  date: string;
  pages: number;
  note?: string;
}

interface LibraryStore {
  books: Book[];
  sessions: Session[];
  addBook: (book: Book) => void;
  deleteBook: (id: string) => void;
  updateBook: (id: string, patch: Partial<Book>) => void;
  addSession: (session: Session) => void;
  deleteSession: (id: string) => void;
}

export const useLibraryStore = create<LibraryStore>((set) => ({
  books: [],
  sessions: [],
  addBook: (book) => set((state) => ({ books: [...state.books, book] })),
  deleteBook: (id) => set((state) => ({ 
    books: state.books.filter(b => b.id !== id),
    sessions: state.sessions.filter(s => s.bookId !== id)
  })),
  updateBook: (id, patch) => set((state) => ({
    books: state.books.map(b => b.id === id ? { ...b, ...patch } : b)
  })),
  addSession: (session) => set((state) => ({ sessions: [...state.sessions, session] })),
  deleteSession: (id) => set((state) => ({
    sessions: state.sessions.filter(s => s.id !== id)
  }))
}));
