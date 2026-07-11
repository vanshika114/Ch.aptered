import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingButton } from '../components/ui/LoadingButton';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const tempErrors: Record<string, string> = {};
    if (!email) tempErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) tempErrors.email = 'Please enter a valid email address';
    if (!password) tempErrors.password = 'Password is required';
    else if (password.length < 8) tempErrors.password = 'Password must be at least 8 characters long';
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    if (!validate()) return;
    setIsSubmitting(true);
    const res = await login(email, password);
    setIsSubmitting(false);
    if (res.success) navigate('/');
    else if (res.errors) setErrors(res.errors);
    else if (res.error) setGeneralError(res.error);
    else setGeneralError('An unexpected error occurred. Please try again.');
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-ink to-ink-soft relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #d4863a 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-green/8 rounded-full blur-3xl" />
        <div className="relative z-10 text-center max-w-md">
          <div className="text-7xl mb-6 opacity-60">📖</div>
          <h1 className="font-serif text-4xl font-black text-cream tracking-tight leading-tight">
            Ch<span className="text-amber">.</span>aptered
          </h1>
          <p className="text-cream/50 text-sm mt-4 leading-relaxed">
            Turn reading from a solo habit into a shared experience. Track your library, log sessions, and join book clubs.
          </p>
          <div className="flex gap-8 justify-center mt-10">
            <div className="text-center">
              <p className="font-serif text-2xl font-black text-amber">100+</p>
              <p className="text-cream/40 text-xs mt-1">Books Tracked</p>
            </div>
            <div className="w-px bg-cream/10" />
            <div className="text-center">
              <p className="font-serif text-2xl font-black text-amber">50+</p>
              <p className="text-cream/40 text-xs mt-1">Active Readers</p>
            </div>
            <div className="w-px bg-cream/10" />
            <div className="text-center">
              <p className="font-serif text-2xl font-black text-amber">10+</p>
              <p className="text-cream/40 text-xs mt-1">Book Clubs</p>
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
            <h2 className="font-serif text-3xl font-black text-ink tracking-tight">Welcome back</h2>
            <p className="text-muted text-sm mt-2">Sign in to pick up where you left off.</p>
          </div>

          {generalError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6 flex items-center gap-2.5">
              <svg className="w-4 h-4 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-widest mb-1.5 block">Email</label>
              <div className={`flex items-center bg-card border rounded-xl focus-within:ring-2 transition-all ${errors.email ? 'border-red-300 focus-within:ring-red-200' : 'border-border-dark focus-within:border-amber focus-within:ring-amber/15'}`}>
                <span className="pl-3.5 text-muted-lite">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </span>
                <input
                  type="email" value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: '' }); }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className="flex-1 bg-transparent outline-none px-2.5 py-2.5 text-sm text-ink-soft placeholder:text-muted-lite"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.email}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-muted uppercase tracking-widest">Password</label>
                <Link to="/forgot-password" className="text-[11px] font-semibold text-muted hover:text-amber transition-colors">Forgot?</Link>
              </div>
              <div className={`flex items-center bg-card border rounded-xl focus-within:ring-2 transition-all ${errors.password ? 'border-red-300 focus-within:ring-red-200' : 'border-border-dark focus-within:border-amber focus-within:ring-amber/15'}`}>
                <span className="pl-3.5 text-muted-lite">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <input
                  type="password" value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: '' }); }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className="flex-1 bg-transparent outline-none px-2.5 py-2.5 text-sm text-ink-soft placeholder:text-muted-lite"
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs font-semibold mt-1.5">{errors.password}</p>}
            </div>

            <LoadingButton type="submit" loading={isSubmitting} className="w-full justify-center !rounded-xl !py-[14px] !text-[16px] !shadow-lg">
              Sign In
            </LoadingButton>
          </form>

          <div className="mt-8 text-center">
            <p className="text-muted text-sm">
              New here?{' '}
              <Link to="/signup" className="text-amber font-bold hover:text-amber-deep transition-colors">Create an account</Link>
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
