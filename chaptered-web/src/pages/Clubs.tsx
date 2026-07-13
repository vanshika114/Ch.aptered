import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useClubStore, type Club } from '../store/useClubStore';

import { LoadingButton } from '../components/ui/LoadingButton';

function toast(msg: string, type = '') {
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' ' + type : '');
  el.textContent = msg;
  const c = document.getElementById('tc');
  if (c) { c.appendChild(el); setTimeout(() => el.remove(), 2800); }
}

export const Clubs: React.FC = () => {
  const { clubs, loading, error, fetchClubs, joinClub, requestJoin, joinByInviteCode } = useClubStore();
  const [inviteCode, setInviteCode] = useState('');
  const navigate = useNavigate();
  const [view, setView] = useState<'all' | 'mine'>('all');

  useEffect(() => { fetchClubs(view === 'mine'); }, [fetchClubs, view]);

  const handleJoin = async (id: string, type: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (type === 'semi_private') {
      const res = await requestJoin(id);
      if (res.success) fetchClubs(view === 'mine');
      return;
    }
    const res = await joinClub(id);
    if (res.success) fetchClubs(view === 'mine');
  };

  const visibleClubs = view === 'all' ? clubs.filter((c) => c.type !== 'private') : clubs;

  return (
    <div className="page-pad min-h-screen">
      <div className="page-wide">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5 mb-8">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl font-black text-cream tracking-tight">Book Clubs</h1>
            <p className="text-cream/70 mt-1.5">Join a club or create your own reading community.</p>
          </div>
          <Link to="/clubs/create" className="btn shrink-0">+ Create Club</Link>
        </div>

        <div className="flex items-center gap-3 mb-8 flex-wrap">
          <button onClick={() => setView('all')} className={`chip cursor-pointer ${view === 'all' ? 'chip-active' : ''}`}>All Clubs</button>
          <button onClick={() => setView('mine')} className={`chip cursor-pointer ${view === 'mine' ? 'chip-active' : ''}`}>My Clubs</button>
          <div className="ml-auto flex items-center gap-2">
            <input
              type="text"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              placeholder="Enter invite code"
              className="input-f w-40 text-sm"
              onKeyDown={(e) => { if (e.key === 'Enter') { joinByInviteCode(inviteCode).then((r) => { if (r.success) { toast('Joined club!'); fetchClubs(view === 'mine'); setInviteCode(''); } else toast(r.error || 'Invalid code', 'err'); }); } }}
            />
            <LoadingButton
              onClick={() => { joinByInviteCode(inviteCode).then((r) => { if (r.success) { toast('Joined club!'); fetchClubs(view === 'mine'); setInviteCode(''); } else toast(r.error || 'Invalid code', 'err'); }); }}
              className="btn btn-sm"
            >
              Join
            </LoadingButton>
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map((i) => (
              <div key={i} className="card-r p-6">
                <div className="sk h-5 w-3/4 rounded mb-3" />
                <div className="sk h-3 w-1/3 rounded mb-4" />
                <div className="sk h-12 w-full rounded mb-4" />
                <div className="sk h-4 w-1/2 rounded" />
              </div>
            ))}
          </div>
        )}

        {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-5 py-3.5 rounded-xl mb-5">{error}</div>}

        {!loading && !error && visibleClubs.length === 0 && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4 opacity-30">📚</div>
            <p className="text-muted text-lg font-medium">No clubs found</p>
            <p className="text-muted-lite text-sm mt-1">{view === 'mine' ? "You haven't joined any clubs yet." : 'Be the first to create one!'}</p>
            <Link to="/clubs/create" className="btn mt-6 inline-flex">Create a Club</Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleClubs.map((club: Club) => (
            <div
              key={club._id}
              onClick={() => navigate(`/clubs/${club._id}`)}
              className="card-r card-r-hover cursor-pointer flex flex-col"
            >
              <div className="p-5 pb-2">
                <h3 className="font-serif text-lg font-bold text-ink-soft">{club.name}</h3>
                <p className="text-xs text-muted font-semibold mt-0.5">{club.members?.length || 1} {club.members?.length === 1 ? 'member' : 'members'}</p>
              </div>
              <div className="px-5 pb-2 flex-1">
                <p className="text-sm text-muted leading-relaxed line-clamp-3">{club.description}</p>
                {club.currentBook && (
                  <div className="mt-3 bg-warm border border-border/60 rounded-lg px-3 py-2">
                    <p className="text-[10px] font-bold text-muted uppercase tracking-wider">Reading Now</p>
                    <p className="text-xs font-bold text-ink-soft truncate">{club.currentBook.title}</p>
                  </div>
                )}
              </div>
              <div className="px-5 py-3 border-t border-border/40 flex items-center justify-between">
                <span className="text-xs font-semibold text-muted">{club.type === 'public' ? 'Public' : club.type === 'semi_private' ? 'Semi-Private' : 'Private'}</span>
                <LoadingButton onClick={(e) => handleJoin(club._id, club.type, e)} className="btn btn-sm">
                  {club.type === 'semi_private' ? 'Request to Join' : 'Join Club'}
                </LoadingButton>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
