import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';

interface OTPVerificationProps {
  email: string;
  onSuccess: (userData: any) => void;
  onBack: () => void;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  onSuccess,
  onBack,
}) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Handle OTP input
  const handleOTPChange = (
    index: number,
    value: string
  ) => {
    const newOTP = [...otp];
    newOTP[index] = value.slice(-1); // Only last character

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    setOtp(newOTP);
    setError('');
  };

  // Handle backspace
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Submit OTP
  const handleSubmit = async () => {
    const otpString = otp.join('');

    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/verify-otp', {
        email,
        otp: otpString,
      });

      if (response.data.success) {
        onSuccess(response.data.user);
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.error || 'OTP verification failed';
      setError(errorMsg);

      if (err.response?.status === 429) {
        setCanResend(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/auth/resend-otp', { email });

      if (response.data.success) {
        setOtp(['', '', '', '', '', '']);
        setTimeLeft(600);
        setCanResend(false);
        setError('');
        inputRefs.current[0]?.focus();
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4 py-10">
      <div className="bg-card border border-border-dark shadow-[0_18px_50px_rgba(42,31,25,0.08)] rounded-[28px] max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-amber/10 border border-amber/30 mb-4">
            <span className="font-serif text-2xl font-black text-ink">C<span className="text-amber">.</span></span>
          </div>
          <h2 className="font-serif text-3xl font-black text-ink tracking-tight mb-2">
            Verify your email
          </h2>
          <p className="text-sm text-muted">
            We sent a 6-digit code to <span className="font-semibold text-ink-soft">{email}</span>
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="mb-8">
          <label className="block text-[11px] font-bold uppercase tracking-[0.18em] text-muted mb-4 text-center">
            Enter code
          </label>
          <div className="flex gap-2 justify-center">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOTPChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-2xl font-bold border-2 border-border-dark rounded-xl bg-[#fffaf5] text-ink-soft focus:border-amber focus:outline-none focus:ring-2 focus:ring-amber/20 transition-all placeholder:text-muted-lite"
                placeholder="•"
              />
            ))}
          </div>
        </div>

        <div className="text-center mb-6">
          {timeLeft > 0 ? (
            <p className="text-sm text-muted">
              Code expires in <span className="font-semibold text-amber">{formatTime(timeLeft)}</span>
            </p>
          ) : (
            <p className="text-sm text-red-600">Code has expired</p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || otp.some((d) => !d)}
          className="w-full bg-ink hover:bg-ink-soft disabled:bg-muted-lite text-cream font-semibold py-3 rounded-xl transition mb-4 shadow-[0_12px_30px_rgba(25,18,14,0.18)]"
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>

        <div className="text-center text-sm">
          {canResend ? (
            <>
              <span className="text-muted mr-2">Didn't receive the code?</span>
              <button
                onClick={handleResend}
                disabled={loading}
                className="text-amber hover:text-amber/80 font-semibold"
              >
                Resend OTP
              </button>
            </>
          ) : (
            <p className="text-muted">
              You can resend the code after <span className="font-semibold text-ink-soft">{formatTime(timeLeft)}</span>
            </p>
          )}
        </div>

        <button
          onClick={onBack}
          disabled={loading}
          className="w-full mt-4 py-2 text-muted hover:text-ink font-semibold"
        >
          ← Back
        </button>
      </div>
    </div>
  );
};

export default OTPVerification;