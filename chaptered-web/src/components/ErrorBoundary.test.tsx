/**
 * Test suite for the ErrorBoundary component.
 * Verifies normal child rendering, error catching, and the crash fallback screen.
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

const BuggyComponent = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test crash error');
  }
  return <div>Safe child content</div>;
};

describe('ErrorBoundary', () => {
  it('renders children normally when no error occurs', () => {
    render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText('Safe child content')).toBeInTheDocument();
  });

  it('catches rendering errors and displays the crash screen', () => {
    // Silence expected console error logs during intentional test crash
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <BuggyComponent shouldThrow={true} />
      </ErrorBoundary>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Error: Test crash error')).toBeInTheDocument();

    spy.mockRestore();
  });
});
