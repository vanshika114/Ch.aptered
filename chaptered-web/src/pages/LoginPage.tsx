/**
 * LoginPage page component.
 * Provides user login form with live front-end validation, backend integration, and redirects.
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
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
    
    if (!email) {
      tempErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      tempErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      tempErrors.password = 'Password is required';
    } else if (password.length < 8) {
      tempErrors.password = 'Password must be at least 8 characters long';
    }

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

    if (res.success) {
      navigate('/');
    } else {
      if (res.errors) {
        setErrors(res.errors);
      } else if (res.error) {
        setGeneralError(res.error);
      } else {
        setGeneralError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-cream px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(var(--color-amber-glow)_1px,transparent_1px)] [background-size:16px_16px] opacity-60 pointer-events-none" />
      
      <Card className="max-w-md w-full p-6 md:p-8 bg-card border border-border/80 shadow-lg relative z-10">
        <div className="text-center mb-6">
          <Link to="/" className="text-2xl font-bold tracking-tight text-ink font-sans">
            Ch<span className="text-amber">.</span>aptered
          </Link>
          <h2 className="font-serif text-3xl font-bold text-ink-soft mt-3">Welcome Back</h2>
          <p className="text-muted text-sm mt-1">Sign in to sync your library and track reading streaks</p>
        </div>

        {generalError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4 flex items-start gap-2.5">
            <span className="text-red-500 mt-0.5">⚠️</span>
            <span>{generalError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-muted uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              placeholder="you@example.com"
              className={`w-full bg-cream/20 border ${
                errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-border-dark focus:border-amber focus:ring-amber-glow'
              } rounded-lg px-3.5 py-2.5 text-sm text-ink-soft transition-all placeholder:text-muted-lite focus:ring-4 focus:outline-none`}
            />
            {errors.email && (
              <p className="text-red-600 text-xs font-semibold mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-[11px] font-bold text-muted uppercase tracking-wider">
                Password
              </label>
              <a
                href="#forgot-password"
                onClick={(e) => {
                  e.preventDefault();
                  alert('Password reset is not yet implemented. Please create a new account.');
                }}
                className="text-[11px] font-bold text-muted hover:text-amber transition-colors uppercase tracking-wider"
              >
                Forgot Password?
              </a>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              placeholder="••••••••"
              className={`w-full bg-cream/20 border ${
                errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : 'border-border-dark focus:border-amber focus:ring-amber-glow'
              } rounded-lg px-3.5 py-2.5 text-sm text-ink-soft transition-all placeholder:text-muted-lite focus:ring-4 focus:outline-none`}
            />
            {errors.password && (
              <p className="text-red-600 text-xs font-semibold mt-1">{errors.password}</p>
            )}
          </div>

          <LoadingButton
            type="submit"
            loading={isSubmitting}
            className="w-full mt-2 font-semibold tracking-wide py-2.5 rounded-lg flex justify-center text-center justify-items-center"
          >
            Sign In
          </LoadingButton>
        </form>

        <div className="mt-6 text-center text-sm border-t border-border/40 pt-4">
          <p className="text-muted">
            Don't have an account?{' '}
            <Link to="/signup" className="text-amber hover:text-amber-deep font-semibold transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};
