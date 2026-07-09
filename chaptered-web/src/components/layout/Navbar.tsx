/* This component renders the main Navbar with branding, navigation links, simulated auth states, and dropdown menus. */
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MobileMenu } from './MobileMenu';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileToggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Discover', path: '/discover' },
    { name: 'My Books', path: '/library' },
    { name: 'Book Clubs', path: '/clubs' },
    { name: 'Profile', path: '/profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-[14px] border-b border-border h-16 flex items-center justify-between px-6 md:px-12 select-none">
      <a 
        href="#main-content" 
        className="sr-only focus:not-sr-only absolute top-4 left-4 bg-amber text-white px-4 py-2 rounded-lg font-bold z-[100]"
      >
        Skip to main content
      </a>

      <Link to="/" className="logo text-xl font-black font-serif text-ink tracking-tight flex items-center gap-1">
        Chaptered<span className="text-amber">.</span>
      </Link>

      <nav className="hidden md:flex items-center gap-8" aria-label="Desktop Navigation">
        {navLinks.map((link) => {
          const active = isActive(link.path);
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`text-sm font-medium transition-colors ${
                active ? 'text-amber font-bold' : 'text-muted hover:text-ink'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-4">
        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2 rounded-full cursor-pointer"
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
              aria-label="User menu"
            >
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80"
                alt="User Avatar"
                className="w-9 h-9 rounded-full border border-border/80 object-cover"
              />
            </button>

            {isDropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg py-2 z-50 text-left"
                role="menu"
              >
                <div className="px-4 py-2 border-b border-border/40">
                  <p className="text-xs font-bold text-ink-soft">Guest Reader</p>
                  <p className="text-[10px] text-muted truncate">guest@chaptered.com</p>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setIsDropdownOpen(false)}
                  className="block px-4 py-2 text-sm text-ink-soft hover:bg-warm/50"
                  role="menuitem"
                >
                  My Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-warm/50 font-semibold"
                  role="menuitem"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={handleLogin}
              className="px-4 py-2 text-sm font-semibold text-muted hover:text-ink transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={handleLogin}
              className="btn px-4 py-2 text-sm font-bold rounded-lg shadow-sm cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        )}

        <button
          ref={mobileToggleRef}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex items-center justify-center p-2 text-ink hover:bg-warm/50 rounded-lg transition-colors cursor-pointer"
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle Navigation Menu"
        >
          <svg 
            width="22" 
            height="22" 
            viewBox="0 0 22 22" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.2" 
            strokeLinecap="round"
          >
            {isMobileMenuOpen ? (
              <path d="M4 18L18 4M4 4l14 14" />
            ) : (
              <path d="M3 5h16M3 11h16M3 17h16" />
            )}
          </svg>
        </button>
      </div>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        navLinks={navLinks}
        isActive={isActive}
        isAuthenticated={isAuthenticated}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
    </header>
  );
};
