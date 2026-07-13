import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LoadingButton } from '../components/ui/LoadingButton';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!email) { setError('Email is required'); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) setMessage(data.message);
      else setError(data.error);
    } catch { setError('Network error'); }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-ink to-ink-soft relative overflow-hidden items-center justify-center p-12">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 25% 25%, #d4863a 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber/8 rounded-full blur-3xl" />
        <div className="relative z-10 text-center max-w-md">
          <div className="text-7xl mb-6 opacity-60">🔐</div>
          <h1 className="font-serif text-4xl font-black text-cream tracking-tight">Ch<span className="text-amber">.</span>aptered</h1>
          <p className="text-cream/50 text-sm mt-4 leading-relaxed">No worries — we'll help you get back into your account.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden text-center mb-10">
            <Link to="/" className="font-serif text-2xl font-black text-ink tracking-tight">Ch<span className="text-amber">.</span>aptered</Link>
          </div>

          <div className="text-center mb-8">
            <h2 className="font-serif text-3xl font-black text-ink tracking-tight">Reset password</h2>
            <p className="text-muted text-sm mt-2">Enter your email and we'll send you a reset link.</p>
          </div>

          {message && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3.5 rounded-xl mb-6 flex items-center gap-2.5">
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              <span>{message}</span>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-bold text-muted uppercase tracking-widest mb-1.5 block">Email</label>
              <div className="flex items-center bg-card border border-border-dark rounded-xl focus-within:ring-2 focus-within:border-amber focus-within:ring-amber/15 transition-all">
                <span className="pl-3.5 text-muted-lite">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                </span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com"
                  className="flex-1 bg-transparent outline-none px-2.5 py-2.5 text-sm text-ink-soft placeholder:text-muted-lite" />
              </div>
            </div>
            <LoadingButton type="submit" loading={isSubmitting} className="w-full justify-center !rounded-xl !py-2.5 !shadow-lg">
              Send Reset Link
            </LoadingButton>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="text-sm font-semibold text-muted hover:text-amber transition-colors">← Back to login</Link>
          </div>
        </div>
      </div>
    </div>
  );
};
