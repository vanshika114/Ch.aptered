import { useAuth } from '../context/AuthContext';
import { useLibraryStore } from '../store/useLibraryStore';


export const Profile: React.FC = () => {
  const { user } = useAuth();
  const { getBooksStats, getTotalPagesRead, getStreak } = useLibraryStore();
  const stats = getBooksStats();

  if (!user) return null;

  return (
    <div className="page-pad min-h-screen">
      <div className="page-med">
        <div className="card-r p-8 md:p-10 mb-8 text-center">
          <div className="w-20 h-20 rounded-full bg-amber text-white flex items-center justify-center text-3xl font-bold mx-auto shadow-lg shadow-amber/30">
            {user.username.charAt(0).toUpperCase()}
          </div>
          <h1 className="font-serif text-3xl font-black text-ink mt-4">{user.username}</h1>
          <p className="text-muted mt-1">{user.email}</p>
          <p className="text-xs text-muted-lite mt-2">Member since {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="card-r p-6 text-center">
            <p className="font-serif text-3xl font-black text-amber">{stats.total}</p>
            <p className="text-xs text-muted font-semibold uppercase tracking-wider mt-1.5">Total Books</p>
          </div>
          <div className="card-r p-6 text-center">
            <p className="font-serif text-3xl font-black text-amber">{getTotalPagesRead()}</p>
            <p className="text-xs text-muted font-semibold uppercase tracking-wider mt-1.5">Pages Read</p>
          </div>
          <div className="card-r p-6 text-center">
            <p className="font-serif text-3xl font-black text-amber">{getStreak()}</p>
            <p className="text-xs text-muted font-semibold uppercase tracking-wider mt-1.5">Day Streak</p>
          </div>
        </div>

        <div className="card-r p-8">
          <h2 className="font-serif text-xl font-black text-ink mb-6">Reading Progress</h2>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-semibold text-muted">Completed</span>
                <span className="text-sm font-bold text-ink">{stats.completed}</span>
              </div>
              <div className="w-full h-3 bg-warm rounded-full overflow-hidden">
                <div className="h-full bg-green rounded-full transition-all duration-700" style={{ width: `${stats.total ? Math.round((stats.completed / stats.total) * 100) : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-semibold text-muted">Reading</span>
                <span className="text-sm font-bold text-ink">{stats.reading}</span>
              </div>
              <div className="w-full h-3 bg-warm rounded-full overflow-hidden">
                <div className="h-full bg-amber rounded-full transition-all duration-700" style={{ width: `${stats.total ? Math.round((stats.reading / stats.total) * 100) : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-semibold text-muted">Not Started</span>
                <span className="text-sm font-bold text-ink">{stats.notStarted}</span>
              </div>
              <div className="w-full h-3 bg-warm rounded-full overflow-hidden">
                <div className="h-full bg-muted-lite rounded-full transition-all duration-700" style={{ width: `${stats.total ? Math.round((stats.notStarted / stats.total) * 100) : 0}%` }} />
              </div>
            </div>
          </div>
          {stats.total === 0 && (
            <p className="text-center text-muted text-sm mt-6">Add some books to see your reading progress!</p>
          )}
        </div>
      </div>
    </div>
  );
};
