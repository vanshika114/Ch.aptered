import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLibraryStore, type Book } from '../store/useLibraryStore';
import { BookCard } from '../components/ui/BookCard';
import { BookListSkeleton } from '../components/ui/BookListSkeleton';

const GENRES = ['All', 'Fiction', 'Non-Fiction', 'Fantasy', 'Science Fiction', 'Mystery', 'Romance', 'Biography', 'Self-Help', 'History'];

export const Discover: React.FC = () => {
  const { books, getBookProgress } = useLibraryStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  const filtered = books.filter((b: Book) => {
    const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
    const matchGenre = selectedGenre === 'All' || b.genre === selectedGenre;
    return matchSearch && matchGenre;
  });

  return (
    <div className="page-pad min-h-screen">
      <div className="page-wide">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl md:text-5xl font-black text-cream tracking-tight">Discover Books</h1>
          <p className="text-cream/70 mt-3 text-lg max-w-lg mx-auto">Browse your library and find your next great read.</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-10 items-center justify-between">
          <div className="relative w-full md:w-96">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-lite pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-f pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {GENRES.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGenre(g)}
                className={`chip cursor-pointer ${selectedGenre === g ? 'chip-active' : ''}`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <BookListSkeleton />
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-5xl mb-4 opacity-30">📖</div>
            <p className="text-muted text-lg font-medium">No books found</p>
            <p className="text-muted-lite text-sm mt-1">Try a different search or add books to your library.</p>
            <Link to="/library" className="btn mt-6 inline-flex">Go to Library</Link>
          </div>
        ) : (
          <div className="books-grid">
            {filtered.map((b: Book) => (
              <BookCard
                key={b.id}
                title={b.title}
                author={b.author}
                genre={b.genre}
                pages={b.pages}
                progress={getBookProgress(b.id)}
                color={b.color}
                onView={() => navigate('/library')}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
