import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface DashboardStats {
  booksCount: number;
  totalPagesRead: number;
  totalMinutes: number;
  currentStreak: number;
  longestStreak: number;
  heatmap: { date: string; pages: number; level: number }[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

const LEVEL_COLORS = ['bg-warm-deep', 'bg-green/30', 'bg-green/55', 'bg-green/75', 'bg-green'];

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('chaptered-token');
        const response = await fetch('/api/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          setError('Failed to load stats');
        }
      } catch {
        setError('Network error loading dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (!user) return null;

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
  };

  const now = new Date();
  const currentMonth = now.getMonth() + monthOffset;
  const currentYear = now.getFullYear() + Math.floor(currentMonth / 12);
  const monthIndex = ((currentMonth % 12) + 12) % 12;

  const startOfMonth = new Date(currentYear, monthIndex, 1);
  const endOfMonth = new Date(currentYear, monthIndex + 1, 0);
  const startDay = startOfMonth.getDay();
  const daysInMonth = endOfMonth.getDate();

  const heatmapByDate: Record<string, { pages: number; level: number }> = {};
  stats?.heatmap?.forEach((d) => { heatmapByDate[d.date] = { pages: d.pages, level: d.level }; });

  return (
    <div className="page-pad min-h-screen">
      <div className="page-wide">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-black text-cream tracking-tight">Dashboard</h1>
            <p className="text-cream/70 mt-1 text-sm">Your reading activity at a glance.</p>
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[1,2,3,4].map((i) => (
              <div key={i} className="card-r p-6"><div className="sk h-8 w-16 rounded mb-2" /><div className="sk h-3 w-24 rounded" /></div>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-5 py-3.5 rounded-xl mb-5">{error}</div>
        )}

        {stats && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
              <div className="card-r p-6 text-center">
                <p className="font-serif text-3xl font-black text-amber">{stats.booksCount}</p>
                <p className="text-[11px] text-muted font-semibold uppercase tracking-wider mt-1.5">Books Added</p>
              </div>
              <div className="card-r p-6 text-center">
                <p className="font-serif text-3xl font-black text-amber">{stats.totalPagesRead.toLocaleString()}</p>
                <p className="text-[11px] text-muted font-semibold uppercase tracking-wider mt-1.5">Pages Read</p>
              </div>
              <div className="card-r p-6 text-center">
                <p className="font-serif text-3xl font-black text-amber">{formatTime(stats.totalMinutes)}</p>
                <p className="text-[11px] text-muted font-semibold uppercase tracking-wider mt-1.5">Time Spent Reading</p>
              </div>
              <div className="card-r p-6 text-center">
                <p className="font-serif text-3xl font-black text-amber">{stats.currentStreak}<span className="text-lg text-muted-lite ml-1">/ {stats.longestStreak}</span></p>
                <p className="text-[11px] text-muted font-semibold uppercase tracking-wider mt-1.5">Current / Longest Streak</p>
              </div>
            </div>

            <div className="card-r p-6 md:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-lg font-bold text-ink">Reading Calendar</h2>
                <div className="flex items-center gap-2">
                  <button onClick={() => setMonthOffset(monthOffset - 1)} className="btn-o px-3 py-1 text-xs">&larr;</button>
                  <span className="text-sm font-bold text-ink-soft min-w-[120px] text-center">{MONTHS[monthIndex]} {currentYear}</span>
                  <button onClick={() => setMonthOffset(monthOffset + 1)} className="btn-o px-3 py-1 text-xs">&rarr;</button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 mb-4 text-[10px] text-muted font-semibold">
                <span>Less</span>
                {LEVEL_COLORS.map((c, i) => (
                  <div key={i} className={`w-3.5 h-3.5 rounded-sm ${c}`} />
                ))}
                <span>More</span>
              </div>

              <div className="overflow-x-auto">
                <div className="grid gap-1" style={{ gridTemplateColumns: '28px repeat(7, 1fr)' }}>
                  {DAYS.map((d, i) => (
                    <div key={i} className="text-[10px] text-muted font-semibold text-right pr-1 h-4 flex items-center justify-end">{d}</div>
                  ))}
                  {Array.from({ length: startDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const day = i + 1;
                    const dateStr = `${currentYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const entry = heatmapByDate[dateStr];
                    const level = entry?.level || 0;
                    return (
                      <div
                        key={dateStr}
                        className={`w-full aspect-square rounded-sm ${LEVEL_COLORS[level]} cursor-default`}
                        title={`${dateStr}: ${entry?.pages || 0} pages`}
                      />
                    );
                  })}
                </div>
              </div>

              <p className="text-[10px] text-muted-lite mt-4 text-center">
                Showing {daysInMonth} day{daysInMonth !== 1 ? 's' : ''} of {MONTHS[monthIndex]} {currentYear}. Darker = more pages read.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
