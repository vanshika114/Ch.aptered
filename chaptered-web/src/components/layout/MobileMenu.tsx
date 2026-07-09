/* This component renders the slide-in mobile navigation menu. */
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navLinks: Array<{ name: string; path: string }>;
  isActive: (path: string) => boolean;
  isAuthenticated: boolean;
  onLogin: () => void;
  onLogout: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  onClose,
  navLinks,
  isActive,
  isAuthenticated,
  onLogin,
  onLogout,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`fixed top-16 right-0 bottom-0 z-45 w-72 max-w-full bg-cream border-l border-border shadow-2xl flex flex-col p-6 transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Drawer"
      >
        <nav className="flex flex-col gap-4 mt-4" aria-label="Mobile Navigation Links">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={onClose}
                className={`text-base font-semibold py-2 px-3 rounded-lg transition-colors ${
                  active ? 'bg-ink text-cream font-bold' : 'text-muted hover:bg-warm/50 hover:text-ink'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-6 border-t border-border/60">
          {isAuthenticated ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 px-3 mb-2">
                <img
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80"
                  alt="User avatar"
                  className="w-10 h-10 rounded-full border border-border/80 object-cover"
                />
                <div>
                  <p className="text-sm font-bold text-ink-soft">Guest Reader</p>
                  <p className="text-[10px] text-muted truncate">guest@chaptered.com</p>
                </div>
              </div>
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="w-full btn-o py-2.5 text-sm font-bold rounded-lg text-red-600 border border-red-200 hover:bg-red-50 cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  onLogin();
                  onClose();
                }}
                className="w-full btn-o py-2.5 text-sm font-bold rounded-lg cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  onLogin();
                  onClose();
                }}
                className="w-full btn py-2.5 text-sm font-bold rounded-lg shadow-sm cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
