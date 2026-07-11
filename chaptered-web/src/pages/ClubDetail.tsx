import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useClubStore, type VoteTally } from '../store/useClubStore';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../lib/socket';
import { LoadingButton } from '../components/ui/LoadingButton';

function toast(msg: string, type = '') {
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' ' + type : '');
  el.textContent = msg;
  const c = document.getElementById('tc');
  if (c) { c.appendChild(el); setTimeout(() => el.remove(), 2800); }
}

interface ChatMessage {
  userId: string;
  username: string;
  text: string;
  timestamp: string;
}

export const ClubDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentClub, votes, loading, error, fetchClub, joinClub, requestJoin, leaveClub, fetchVotes, castVote, generateInviteCode, joinByInviteCode } = useClubStore();
  const { sendMessage, onMessage, onTyping, onVoteUpdate } = useSocket(id);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [voteBookId, setVoteBookId] = useState('');
  const [voteTitle, setVoteTitle] = useState('');
  const [voteAuthor, setVoteAuthor] = useState('');
  const [showVoteForm, setShowVoteForm] = useState(false);

  useEffect(() => { if (id) { fetchClub(id); fetchVotes(id); } }, [id, fetchClub, fetchVotes]);

  useEffect(() => {
    if (!id) return;
    const unsubMsg = onMessage((msg: ChatMessage) => setMessages((prev) => [...prev, msg]));
    const unsubTyping = onTyping((data: { userId: string; username: string }) => {
      setTypingUsers((prev) => prev.includes(data.username) ? prev : [...prev, data.username]);
      setTimeout(() => setTypingUsers((prev) => prev.filter((u) => u !== data.username)), 3000);
    });
    const unsubVote = onVoteUpdate(() => { if (id) fetchVotes(id); });
    return () => { unsubMsg(); unsubTyping(); unsubVote(); };
  }, [id, onMessage, onTyping, onVoteUpdate, fetchVotes]);

  const handleSend = () => {
    if (!inputText.trim() || !user) return;
    sendMessage(user.id, user.username, inputText.trim());
    setMessages((prev) => [...prev, { userId: user.id, username: user.username, text: inputText.trim(), timestamp: new Date().toISOString() }]);
    setInputText('');
  };

  const handleVote = async () => {
    if (!voteBookId.trim() || !voteTitle.trim()) return;
    await castVote(id!, voteBookId.trim(), voteTitle.trim(), voteAuthor.trim() || undefined);
    setVoteBookId(''); setVoteTitle(''); setVoteAuthor('');
    setShowVoteForm(false);
  };

  const [joinMsg, setJoinMsg] = useState<string | null>(null);
  const handleJoin = async () => {
    if (!id || !currentClub || !user) return;
    const alreadyMember = currentClub.members.some((m: any) => m._id === user.id || m === user.id);
    if (currentClub.type === 'semi_private' && !alreadyMember) {
      const res = await requestJoin(id);
      if (res.success) setJoinMsg('Join request sent! Awaiting admin approval.');
      else setJoinMsg(res.error || 'Failed to send request');
      return;
    }
    await joinClub(id);
    fetchClub(id);
  };
  const handleLeave = async () => { if (!id) return; await leaveClub(id); navigate('/clubs'); };

  if (loading) return (
    <div className="page-pad min-h-screen flex items-center justify-center">
      <div className="sk w-8 h-8 rounded-full" />
    </div>
  );

  if (error) return (
    <div className="page-pad min-h-screen flex items-center justify-center">
      <div className="text-center"><p className="text-red-300 font-semibold">{error}</p><button onClick={() => navigate('/clubs')} className="btn mt-4">Back to Clubs</button></div>
    </div>
  );

  if (!currentClub) return (
    <div className="page-pad min-h-screen flex items-center justify-center">
      <div className="text-center"><p className="text-cream/70">Club not found.</p><button onClick={() => navigate('/clubs')} className="btn mt-4">Back to Clubs</button></div>
    </div>
  );

  const isMember = user ? currentClub.members.some((m: any) => m._id === user.id || m === user.id) : false;
  const isOwner = user ? currentClub.owner._id === user.id : false;

  const typeLabels: Record<string, string> = {
    public: 'Public',
    semi_private: 'Semi-Private',
    private: 'Private',
  };

  return (
    <div className="page-pad min-h-screen">
      <div className="page-wide">
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate('/clubs')} className="text-sm font-semibold text-cream/70 hover:text-amber transition-colors flex items-center gap-1.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m7-7-7 7 7 7"/></svg>
            Back to Clubs
          </button>
          {isOwner && (
            <button onClick={() => navigate(`/clubs/${id}/settings`)} className="btn-o btn-sm text-xs">Settings</button>
          )}
        </div>

        <div className="card-r p-6 md:p-8 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="font-serif text-3xl md:text-4xl font-black text-ink tracking-tight">{currentClub.name}</h1>
              <p className="text-muted mt-2 leading-relaxed max-w-xl">{currentClub.description}</p>
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted">
                <span className="chip">{currentClub.members.length} {currentClub.members.length === 1 ? 'member' : 'members'}</span>
                <span className={`chip ${currentClub.type === 'private' ? 'chip-warning' : ''}`}>{typeLabels[currentClub.type] || 'Public'}</span>
                {currentClub.currentBook && <span className="chip">Reading: {currentClub.currentBook.title}</span>}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              {joinMsg && <p className="text-sm text-amber font-semibold">{joinMsg}</p>}
              {!isMember ? (
                currentClub.type === 'private' ? (
                  <div className="flex gap-2">
                    <input id="invite-input" type="text" placeholder="Invite code" className="input-f w-36 text-sm" onKeyDown={(e) => { if (e.key === 'Enter') { const code = (document.getElementById('invite-input') as HTMLInputElement)?.value; if (code) joinByInviteCode(code).then((r) => { if (r.success) { toast('Joined club!'); fetchClub(id!); } else toast(r.error || 'Invalid code', 'err'); }); } }} />
                    <LoadingButton onClick={() => { const code = (document.getElementById('invite-input') as HTMLInputElement)?.value; if (code) joinByInviteCode(code).then((r) => { if (r.success) { toast('Joined club!'); fetchClub(id!); } else toast(r.error || 'Invalid code', 'err'); }); }} className="btn">Join</LoadingButton>
                  </div>
                ) : (
                  <LoadingButton onClick={handleJoin} className="btn">
                    {currentClub.type === 'semi_private' ? 'Request to Join' : 'Join Club'}
                  </LoadingButton>
                )
              ) : !isOwner ? (
                <button onClick={handleLeave} className="btn-o text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300">Leave Club</button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {isMember && (
              <div className="card-r">
                <div className="px-6 py-4 border-b border-border/40">
                  <h2 className="font-serif text-lg font-bold text-ink">Chat</h2>
                </div>
                <div className="h-80 overflow-y-auto p-4 space-y-3 bg-warm/30">
                  {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <p className="text-muted text-sm">No messages yet.</p>
                      <p className="text-muted-lite text-xs mt-1">Start the conversation!</p>
                    </div>
                  )}
                  {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.userId === user?.id ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${m.userId === user?.id ? 'bg-amber text-white rounded-br-md' : 'bg-card border border-border text-ink-soft rounded-bl-md'}`}>
                        {m.userId !== user?.id && <p className="text-[10px] font-bold text-muted mb-0.5">{m.username}</p>}
                        <p>{m.text}</p>
                        <p className="text-[9px] opacity-50 mt-0.5 text-right">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                  ))}
                  {typingUsers.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted italic">
                      <span className="flex gap-0.5">
                        <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </span>
                      {typingUsers.join(', ')} typing...
                    </div>
                  )}
                </div>
                <div className="p-4 border-t border-border/40">
                  <div className="flex gap-2">
                    <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Type a message..." className="input-f" />
                    <button onClick={handleSend} className="btn shrink-0">Send</button>
                  </div>
                </div>
              </div>
            )}

            <div className="card-r">
              <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
                <h2 className="font-serif text-lg font-bold text-ink">Voting</h2>
                {isMember && (
                  <button onClick={() => setShowVoteForm(!showVoteForm)} className="btn btn-sm">
                    {showVoteForm ? 'Cancel' : '+ Nominate'}
                  </button>
                )}
              </div>
              <div className="p-5 space-y-3">
                {votes.length === 0 && !showVoteForm && (
                  <div className="text-center py-8">
                    <p className="text-muted text-sm">No votes yet.</p>
                    <p className="text-muted-lite text-xs mt-1">Nominate a book for the club to read!</p>
                  </div>
                )}
                {votes.map((v: VoteTally, i: number) => (
                  <div key={v.nomineeId} className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-warm/50 border border-border/40">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="text-xs font-bold text-muted w-5 text-right shrink-0">#{i + 1}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-ink-soft truncate">{v.title}</p>
                        {v.author && <p className="text-xs text-muted truncate">{v.author}</p>}
                        <p className="text-[10px] text-muted-lite mt-0.5">{v.count} vote{v.count !== 1 ? 's' : ''}{v.voters.length > 0 ? ` · ${v.voters.join(', ')}` : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="w-8 h-8 rounded-full bg-amber/10 text-amber-deep flex items-center justify-center font-bold text-sm">{v.count}</div>
                    </div>
                  </div>
                ))}
                {showVoteForm && (
                  <div className="mt-4 pt-4 border-t border-border/40 space-y-3">
                    <p className="text-sm font-bold text-ink-soft mb-1">Nominate a Book</p>
                    <div>
                      <label className="text-xs font-semibold text-muted mb-1 block">Book Title *</label>
                      <input type="text" value={voteTitle} onChange={(e) => setVoteTitle(e.target.value)} placeholder="e.g. The Great Gatsby" className="input-f text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted mb-1 block">Author</label>
                      <input type="text" value={voteAuthor} onChange={(e) => setVoteAuthor(e.target.value)} placeholder="e.g. F. Scott Fitzgerald" className="input-f text-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-muted mb-1 block">Book Identifier *</label>
                      <input type="text" value={voteBookId} onChange={(e) => setVoteBookId(e.target.value)} placeholder="e.g. 978-0-7432-7356-5 or a unique ID" className="input-f text-sm" />
                      <p className="text-[10px] text-muted-lite mt-1">ISBN, Google Books ID, or any unique identifier for this book.</p>
                    </div>
                    <LoadingButton onClick={handleVote} className="btn btn-sm">Cast Vote</LoadingButton>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="card-r">
              <div className="px-6 py-4 border-b border-border/40">
                <h2 className="font-serif text-lg font-bold text-ink">Members ({currentClub.members.length})</h2>
              </div>
              <div className="p-4 space-y-2">
                {currentClub.members.map((m: any) => {
                  const name = m.username || m;
                  const isOwnerCheck = (currentClub.owner._id || currentClub.owner) === (m._id || m);
                  return (
                    <div key={m._id || m} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-warm/50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-amber/20 text-amber-deep flex items-center justify-center text-sm font-bold shrink-0">
                        {(typeof name === 'string' ? name.charAt(0).toUpperCase() : '?')}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink-soft truncate">{name} {isOwnerCheck && <span className="text-[10px] font-bold text-amber ml-1">Owner</span>}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {currentClub.currentBook && (
              <div className="card-r">
                <div className="px-6 py-4 border-b border-border/40">
                  <h2 className="font-serif text-lg font-bold text-ink">Current Book</h2>
                </div>
                <div className="p-5">
                  <div className="bg-warm/60 border border-border/50 rounded-xl p-4">
                    <p className="text-sm font-bold text-ink-soft">{currentClub.currentBook.title}</p>
                    {currentClub.currentBook.author && <p className="text-xs text-muted mt-0.5">{currentClub.currentBook.author}</p>}
                  </div>
                </div>
              </div>
            )}

            {isOwner && (
              <div className="card-r">
                <div className="px-6 py-4 border-b border-border/40">
                  <h2 className="font-serif text-lg font-bold text-ink">Invite Code</h2>
                </div>
                <div className="p-5 space-y-3">
                  {currentClub.inviteCode ? (
                    <div className="bg-warm/60 border border-border/50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black font-mono text-ink tracking-widest select-all">{currentClub.inviteCode}</p>
                      <button
                        onClick={() => { navigator.clipboard.writeText(currentClub.inviteCode || ''); toast('Copied!'); }}
                        className="text-xs font-semibold text-amber hover:text-amber-deep mt-2"
                      >
                        Copy to clipboard
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-muted">No invite code yet. Generate one to share with friends.</p>
                  )}
                  <LoadingButton
                    onClick={async () => { const res = await generateInviteCode(id!); if (res.success) { fetchClub(id!); toast('Invite code generated!'); } else toast(res.error || 'Failed', 'err'); }}
                    className="btn btn-sm w-full justify-center"
                  >
                    {currentClub.inviteCode ? 'Regenerate Code' : 'Generate Invite Code'}
                  </LoadingButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div id="tc"></div>
    </div>
  );
};
