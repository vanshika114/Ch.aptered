/* This component acts as the global layout shell, wrapping children pages with the unified Navbar and Footer. */
import React from 'react';
import { Navbar } from './Navbar';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />

      <main id="main-content" className="flex-1 pt-16 outline-none" tabIndex={-1}>
        {children}
      </main>

      <footer className="bg-ink text-cream border-t border-border/10 py-6 px-6 md:px-12 text-center text-xs mt-auto">
        <p className="text-cream/55">
          &copy; {new Date().getFullYear()} Chaptered. Built in public for ELUSoC 2026.
        </p>
      </footer>
    </div>
  );
};
