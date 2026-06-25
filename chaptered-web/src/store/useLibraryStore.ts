import { create } from 'zustand';
import storage, { type Book, type ReadingSession } from '../lib/storage';
import { calculateStreak, calculateProgress, generateId } from '../lib/bookUtils';

interface LibraryStore {
  books: Book[];
  sessions: ReadingSession[];
  
  // Book operations
  addBook: (book: Omit<Book, 'id' | 'createdAt'>) => void;
  deleteBook: (id: string) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  
  // Session operations
  logReadingSession: (bookId: string, pagesRead: number, notes?: string) => void;
  deleteSession: (id: string) => void;
  
  // Calculations
  getBookProgress: (id: string) => number;
  getTotalStreak: () => number;
  getTotalPagesRead: () => number;
  
  // Load from localStorage
  loadFromStorage: () => void;
}

export const useLibraryStore = create<LibraryStore>((set, get) => ({
  books: [],
  sessions: [],

  addBook: (bookData) => {
    const newBook: Book = {
      ...bookData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    storage.addBook(newBook);
    set({ books: storage.getBooks() });
  },

  deleteBook: (id) => {
    storage.deleteBook(id);
    set({
      books: storage.getBooks(),
      sessions: storage.getSessions(),
    });
  },

  updateBook: (id, updates) => {
    storage.updateBook(id, updates);
    set({ books: storage.getBooks() });
  },

  logReadingSession: (bookId, pagesRead, notes) => {
    const session: ReadingSession = {
      id: generateId(),
      bookId,
      pagesRead,
      date: new Date().toISOString().slice(0, 10),
      notes,
    };
    storage.addSession(session);
    set({ sessions: storage.getSessions() });
  },

  deleteSession: (id) => {
    storage.deleteSession(id);
    set({ sessions: storage.getSessions() });
  },

  getBookProgress: (id) => {
    const book = get().books.find(b => b.id === id);
    if (!book) return 0;
    const pagesRead = storage.getPagesReadForBook(id);
    return calculateProgress(pagesRead, book.totalPages);
  },

  getTotalStreak: () => {
    return calculateStreak(get().sessions);
  },

  getTotalPagesRead: () => {
    return storage.getTotalPagesRead();
  },

  loadFromStorage: () => {
    set({
      books: storage.getBooks(),
      sessions: storage.getSessions(),
    });
  },
}));