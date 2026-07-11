import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading, authError, retryAuth } = useAuth();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-cream text-ink">
        <svg
          className="animate-spin h-10 w-10 text-amber"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        <p className="mt-4 font-semibold text-muted text-sm tracking-wide">Entering the Library...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (authError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-cream text-ink px-6">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md text-center">
            <p className="text-red-600 font-bold text-lg mb-2">Connection Lost</p>
            <p className="text-red-500 text-sm leading-relaxed">{authError}</p>
            <button onClick={retryAuth} className="btn mt-5">Retry</button>
          </div>
        </div>
      );
    }
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
