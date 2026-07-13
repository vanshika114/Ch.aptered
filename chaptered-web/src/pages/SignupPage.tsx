import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingButton } from '../components/ui/LoadingButton';
import { useUsernameCheck } from '../hooks/useUsernameCheck';

export const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const { username, setUsername, status: usernameStatus } = useUsernameCheck(500);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!username || username.trim().length < 3) tempErrors.username = 'Username must be at least 3 characters';
    if (!email) tempErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) tempErrors.email = 'Please enter a valid email address';
    if (!password || password.length < 8) tempErrors.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) tempErrors.confirmPassword = 'Passwords do not match';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    if (!validate()) return;
    setIsSubmitting(true);
    const res = await signup(username, email, password);
    setIsSubmitting(false);
    if (res.success) navigate('/');
    else if (res.errors) setErrors(res.errors);
    else if (res.error) setGeneralError(res.error);
    else setGeneralError('An unexpected error occurred.');
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-ink to-ink-soft relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #d4863a 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-green/8 rounded-full blur-3xl" />
        <div className="relative z-10 text-center max-w-md">
          <div className="text-7xl mb-6 opacity-60">📚</div>
          <h1 className="font-serif text-4xl font-black text-cream tracking-tight leading-tight">
            Ch<span className="text-amber">.</span>aptered
          </h1>
          <p className="text-cream/50 text-sm mt-4 leading-relaxed">
            Join a community of readers. Track what you read, discover new books, and share the journey with friends.
          </p>
          <div className="flex gap-8 justify-center mt-10">
            <div className="text-center">
              <p className="font-serif text-2xl font-black text-amber">Free</p>
              <p className="text-cream/40 text-xs mt-1">To Join</p>
            </div>
            <div className="w-px bg-cream/10" />
            <div className="text-center">
              <p className="font-serif text-2xl font-black text-amber">Open</p>
              <p className="text-cream/40 text-xs mt-1">Source</p>
            </div>
            <div className="w-px bg-cream/10" />
            <div className="text-center">
              <p className="font-serif text-2xl font-black text-amber">Built</p>
              <p className="text-cream/40 text-xs mt-1">In Public</p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-10">
            <Link to="/" className="font-serif text-2xl font-black text-ink tracking-tight">
              Ch<span className="text-amber">.</span>aptered
            </Link>
          </div>

          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl font-black text-ink tracking-tight">Create account</h2>
            <p className="text-muted text-sm mt-2">Start your reading journey today.</p>
          </div>

          {generalError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2.5">
              <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-widest mb-1.5 block">Username</label>
              <div className={`flex items-center bg-card border rounded-xl focus-within:ring-2 transition-all ${errors.username ? 'border-red-300 focus-within:ring-red-200' : 'border-border-dark focus-within:border-amber focus-within:ring-amber/15'}`}>
                <span className="pl-3.5 text-muted-lite">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </span>
                <input type="text" value={username} onChange={(e) => { setUsername(e.target.value); if (errors.username) setErrors({ ...errors, username: '' }); }} placeholder="bookworm123" autoComplete="username"
                  className="flex-1 bg-transparent outline-none px-2.5 py-2.5 text-sm text-ink-soft placeholder:text-muted-lite" />
                {username.trim().length >= 3 && usernameStatus.checking && (
                  <span className="pr-3.5 text-muted-lite"><svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeDasharray="31.4 31.4" strokeDashoffset="0" strokeLinecap="round"/></svg></span>
                )}
                {username.trim().length >= 3 && !usernameStatus.checking && usernameStatus.available === true && (
                  <span className="pr-3.5 text-green-600"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg></span>
                )}
                {username.trim().length >= 3 && !usernameStatus.checking && usernameStatus.available === false && (
                  <span className="pr-3.5 text-red-500"><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></span>
                )}
              </div>
              {errors.username && <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.username}</p>}
              {username.trim().length >= 3 && !usernameStatus.checking && usernameStatus.available === true && (
                <p className="text-green-600 text-xs font-semibold mt-1.5 flex items-center gap-1">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Username available
                </p>
              )}
              {username.trim().length >= 3 && !usernameStatus.checking && usernameStatus.available === false && (
                <div className="mt-1.5">
                  <p className="text-red-500 text-xs font-semibold flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    Username already taken
                  </p>
                  {usernameStatus.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {usernameStatus.suggestions.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setUsername(s)}
                          className="text-[11px] font-semibold text-amber bg-amber/8 border border-amber/20 rounded-full px-2.5 py-1 hover:bg-amber/15 hover:border-amber/30 transition-colors"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-widest mb-1.5 block">Email</label>
              <div className={`flex items-center bg-card border rounded-xl focus-within:ring-2 transition-all ${errors.email ? 'border-red-300 focus-within:ring-red-200' : 'border-border-dark focus-within:border-amber focus-within:ring-amber/15'}`}>
                <span className="pl-3.5 text-muted-lite">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </span>
                <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: '' }); }} placeholder="you@example.com" autoComplete="email"
                  className="flex-1 bg-transparent outline-none px-2.5 py-2.5 text-sm text-ink-soft placeholder:text-muted-lite" />
              </div>
              {errors.email && <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.email}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-widest mb-1.5 block">Password</label>
              <div className={`flex items-center bg-card border rounded-xl focus-within:ring-2 transition-all ${errors.password ? 'border-red-300 focus-within:ring-red-200' : 'border-border-dark focus-within:border-amber focus-within:ring-amber/15'}`}>
                <span className="pl-3.5 text-muted-lite">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: '' }); }} placeholder="Min. 8 characters" autoComplete="new-password"
                  className="flex-1 bg-transparent outline-none px-2.5 py-2.5 text-sm text-ink-soft placeholder:text-muted-lite" />
              </div>
              {errors.password && <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.password}</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-widest mb-1.5 block">Confirm Password</label>
              <div className={`flex items-center bg-card border rounded-xl focus-within:ring-2 transition-all ${errors.confirmPassword ? 'border-red-300 focus-within:ring-red-200' : 'border-border-dark focus-within:border-amber focus-within:ring-amber/15'}`}>
                <span className="pl-3.5 text-muted-lite">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>
                </span>
                <input type="password" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' }); }} placeholder="Repeat your password" autoComplete="new-password"
                  className="flex-1 bg-transparent outline-none px-2.5 py-2.5 text-sm text-ink-soft placeholder:text-muted-lite" />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.confirmPassword}</p>}
            </div>

            <LoadingButton type="submit" loading={isSubmitting} className="w-full justify-center !rounded-xl !py-[14px] !text-[16px] !shadow-lg mt-2">
              Create Account
            </LoadingButton>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-amber font-bold hover:text-amber-deep transition-colors">Sign in</Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-border/40 text-center">
            <Link to="/" className="text-xs text-muted-lite hover:text-muted transition-colors">← Back to home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
