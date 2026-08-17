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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-100 px-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-600">
            We sent a code to <span className="font-semibold">{email}</span>
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* OTP Input Fields */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Enter 6-digit code
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
                className="w-12 h-12 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none transition"
                placeholder="•"
              />
            ))}
          </div>
        </div>

        {/* Timer */}
        <div className="text-center mb-6">
          {timeLeft > 0 ? (
            <p className="text-sm text-gray-600">
              Code expires in <span className="font-semibold text-indigo-600">{formatTime(timeLeft)}</span>
            </p>
          ) : (
            <p className="text-sm text-red-600">Code has expired</p>
          )}
        </div>

        {/* Verify Button */}
        <button
          onClick={handleSubmit}
          disabled={loading || otp.some((d) => !d)}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition mb-4"
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>

        {/* Resend OTP */}
        <div className="text-center text-sm">
          {canResend ? (
            <>
              <span className="text-gray-600 mr-2">Didn't receive the code?</span>
              <button
                onClick={handleResend}
                disabled={loading}
                className="text-indigo-600 hover:text-indigo-700 font-semibold"
              >
                Resend OTP
              </button>
            </>
          ) : (
            <p className="text-gray-600">
              You can resend the code after <span className="font-semibold">{formatTime(timeLeft)}</span>
            </p>
          )}
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          disabled={loading}
          className="w-full mt-4 py-2 text-gray-700 hover:text-gray-900 font-semibold"
        >
          ← Back
        </button>
      </div>
    </div>
  );
};

export default OTPVerification;