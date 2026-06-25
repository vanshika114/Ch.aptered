import { useEffect, useState } from 'react';
import { useLibraryStore } from '../store/useLibraryStore';
import { calculateStreak } from '../lib/bookUtils';

export const Library = () => {
  const [addingBook, setAddingBook] = useState(false);
  const {
    books,
    sessions,
    addBook,
    deleteBook,
    updateBook,
    logReadingSession,
    deleteSession,
    getBookProgress,
    getTotalStreak,
    getTotalPagesRead,
    loadFromStorage,
  } = useLibraryStore();

  // Load data on mount
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const handleAddBook = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addBook({
      title: formData.get('title') as string,
      author: formData.get('author') as string,
      totalPages: parseInt(formData.get('totalPages') as string),
      currentPage: 0,
    });
    setAddingBook(false);
    e.currentTarget.reset();
  };

  const handleAddSession = (bookId: string, pages: number) => {
    logReadingSession(bookId, pages);
  };

  return (
    <div className="library">
      <header className="library-header">
        <h1>My Library</h1>
        <div className="library-stats">
          <div className="stat">
            <div className="stat-value">{books.length}</div>
            <div className="stat-label">Books</div>
          </div>
          <div className="stat">
            <div className="stat-value">{getTotalPagesRead()}</div>
            <div className="stat-label">Pages Read</div>
          </div>
          <div className="stat">
            <div className="stat-value">{getTotalStreak()}</div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>
      </header>

      {addingBook ? (
        <form onSubmit={handleAddBook} className="add-book-form">
          <input type="text" name="title" placeholder="Book title" required />
          <input type="text" name="author" placeholder="Author" />
          <input type="number" name="totalPages" placeholder="Total pages" required />
          <button type="submit">Add Book</button>
          <button type="button" onClick={() => setAddingBook(false)}>Cancel</button>
        </form>
      ) : (
        <button onClick={() => setAddingBook(true)} className="btn btn-primary">
          + Add Book
        </button>
      )}

      <div className="books-grid">
        {books.map(book => {
          const progress = getBookProgress(book.id);
          const bookSessions = sessions.filter(s => s.bookId === book.id);

          return (
            <div key={book.id} className="book-card">
              {book.cover && <img src={book.cover} alt={book.title} />}
              <h3>{book.title}</h3>
              {book.author && <p className="author">{book.author}</p>}
              
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <p className="progress-text">{progress}% complete</p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const pages = parseInt((e.target as any).pages.value);
                  handleAddSession(book.id, pages);
                  (e.target as any).reset();
                }}
                className="log-session"
              >
                <input type="number" name="pages" placeholder="Pages read today" required />
                <button type="submit">Log</button>
              </form>

              <div className="book-actions">
                <button onClick={() => deleteBook(book.id)} className="btn btn-danger">
                  Delete
                </button>
              </div>

              {bookSessions.length > 0 && (
                <div className="sessions-list">
                  <h4>Recent sessions</h4>
                  {bookSessions.slice(-3).map(session => (
                    <div key={session.id} className="session-item">
                      <span>{session.pagesRead} pages on {session.date}</span>
                      <button onClick={() => deleteSession(session.id)}>✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};