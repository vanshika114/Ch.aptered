/* This file implements the default fallback UI displayed when an error is caught by the ErrorBoundary. */
import React from 'react';

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-cream text-ink select-none text-center"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      <div className="max-w-md w-full bg-card border border-border/80 rounded-2xl p-8 shadow-md">
        <span className="text-5xl block mb-4" aria-hidden="true">
          ⚠️
        </span>
        <h1 className="text-3xl font-serif font-bold text-ink-soft mb-2">
          Something went wrong
        </h1>
        <p className="text-muted mb-6 text-sm md:text-base">
          An unexpected error occurred while rendering this page. We apologize for the inconvenience.
        </p>

        {error && (
          <div className="bg-warm-deep/30 border border-border text-left p-4 rounded-xl mb-6 overflow-x-auto max-h-40">
            <code className="text-xs text-ink-soft font-mono font-semibold break-all whitespace-pre-wrap">
              {error.name}: {error.message}
            </code>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <button
            onClick={onReset}
            className="btn w-full sm:w-auto px-6 py-2.5 font-semibold text-white bg-amber hover:bg-amber-deep transition-colors rounded-xl shadow-sm cursor-pointer"
            aria-label="Try reloading the failed component"
          >
            Try Again
          </button>
          
          <a
            href="/"
            className="btn-o w-full sm:w-auto px-6 py-2.5 font-semibold border border-border hover:bg-warm-deep/40 transition-colors rounded-xl text-center"
            aria-label="Navigate back to home page"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
};
