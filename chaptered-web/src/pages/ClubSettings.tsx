import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useClubStore, type Club } from '../store/useClubStore';
import { LoadingButton } from '../components/ui/LoadingButton';

export const ClubSettings: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentClub, loading, error, fetchClub, approveJoin, rejectJoin, promoteToAdmin, removeMember, generateInviteCode } = useClubStore();
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, setPending] = useState<any[]>([]);

  useEffect(() => {
    if (id) fetchClub(id);
  }, [id, fetchClub]);

  useEffect(() => {
    if (currentClub && (currentClub as any).pendingRequests) {
      setPending((currentClub as any).pendingRequests);
    }
  }, [currentClub]);

  if (!user || !id) return null;
  if (loading) return <div className="page-pad min-h-screen flex items-center justify-center"><div className="sk w-8 h-8 rounded-full" /></div>;
  if (error) return <div className="page-pad min-h-screen flex items-center justify-center"><p className="text-red-300">{error}</p></div>;
  if (!currentClub) return null;

  const isAdmin = currentClub.owner._id === user.id;
  if (!isAdmin) {
    return (
      <div className="page-pad min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-cream/70 text-lg font-semibold">Only admins can access settings.</p>
          <button onClick={() => navigate(`/clubs/${id}`)} className="btn mt-4">Back to Club</button>
        </div>
      </div>
    );
  }

  const handleApprove = async (userId: string) => {
    setActionLoading(`approve-${userId}`);
    await approveJoin(id, userId);
    setActionLoading(null);
    setPending((prev) => prev.filter((r: any) => r.userId !== userId));
  };

  const handleReject = async (userId: string) => {
    setActionLoading(`reject-${userId}`);
    await rejectJoin(id, userId);
    setActionLoading(null);
    setPending((prev) => prev.filter((r: any) => r.userId !== userId));
  };

  const handlePromote = async (userId: string) => {
    setActionLoading(`promote-${userId}`);
    await promoteToAdmin(id, userId);
    setActionLoading(null);
  };

  const handleRemove = async (userId: string) => {
    if (!confirm('Remove this member from the club?')) return;
    setActionLoading(`remove-${userId}`);
    await removeMember(id, userId);
    setActionLoading(null);
  };

  const handleGenerateInvite = async () => {
    setActionLoading('invite');
    const res = await generateInviteCode(id);
    setActionLoading(null);
    if (res.success && res.inviteCode) setInviteCode(res.inviteCode);
  };

  const handleCopy = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const members = currentClub.members || [];

  return (
    <div className="page-pad min-h-screen">
      <div className="page-wide">
        <button onClick={() => navigate(`/clubs/${id}`)} className="text-sm font-semibold text-cream/70 hover:text-amber transition-colors mb-5 flex items-center gap-1.5">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
          Back to {currentClub.name}
        </button>

        <h1 className="font-serif text-3xl font-black text-cream tracking-tight mb-6">Club Settings</h1>

        {pending.length > 0 && (
          <div className="card-r p-6 mb-6">
            <h2 className="font-serif text-lg font-bold text-ink mb-4">Pending Join Requests ({pending.length})</h2>
            <div className="space-y-3">
              {pending.map((req: any) => (
                <div key={req.userId} className="flex items-center justify-between py-2.5 px-4 rounded-lg bg-warm/50 border border-border/40">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber/20 text-amber-deep flex items-center justify-center text-sm font-bold">
                      {(req.username || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink-soft">{req.username}</p>
                      <p className="text-xs text-muted">{req.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <LoadingButton onClick={() => handleApprove(req.userId)} loading={actionLoading === `approve-${req.userId}`} className="btn btn-sm text-xs">Approve</LoadingButton>
                    <button onClick={() => handleReject(req.userId)} className="btn-o btn-sm text-xs text-red-600 border-red-200">Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {pending.length === 0 && (
          <div className="card-r p-6 mb-6">
            <h2 className="font-serif text-lg font-bold text-ink mb-4">Pending Join Requests</h2>
            <p className="text-sm text-muted">No pending requests.</p>
          </div>
        )}

        <div className="card-r p-6 mb-6">
          <h2 className="font-serif text-lg font-bold text-ink mb-4">Members ({members.length})</h2>
          <div className="space-y-2">
            {members.map((m: any) => {
              const name = m.username || m;
              const isOwner = (currentClub.owner._id || currentClub.owner) === (m._id || m);
              return (
                <div key={m._id || m} className="flex items-center justify-between py-2 px-4 rounded-lg hover:bg-warm/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-amber/20 text-amber-deep flex items-center justify-center text-sm font-bold shrink-0">
                      {(typeof name === 'string' ? name.charAt(0).toUpperCase() : '?')}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink-soft truncate">
                        {name}
                        {isOwner && <span className="text-[10px] font-bold text-amber ml-1.5">Owner</span>}
                      </p>
                    </div>
                  </div>
                  {!isOwner && (
                    <div className="flex gap-2">
                      <button onClick={() => handlePromote(m._id || m)} className="btn-o btn-sm text-xs">Promote to Admin</button>
                      <button onClick={() => handleRemove(m._id || m)} className="btn-o btn-sm text-xs text-red-600 border-red-200">Remove</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {currentClub.type === 'private' && (
          <div className="card-r p-6">
            <h2 className="font-serif text-lg font-bold text-ink mb-4">Invite Code</h2>
            {inviteCode ? (
              <div className="flex items-center gap-3">
                <div className="bg-warm border border-border/60 rounded-xl px-4 py-3 font-mono text-lg font-bold text-ink tracking-wider flex-1 text-center">
                  {inviteCode}
                </div>
                <button onClick={handleCopy} className="btn btn-sm">
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            ) : (
              <div>
                <p className="text-sm text-muted mb-3">Generate a unique invite code to share with potential members.</p>
                <LoadingButton onClick={handleGenerateInvite} loading={actionLoading === 'invite'} className="btn btn-sm">Generate Invite Code</LoadingButton>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
