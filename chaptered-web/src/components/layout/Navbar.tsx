import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useClubStore } from '../../store/useClubStore';
import { getSocket } from '../../lib/socket';
import { MobileMenu } from './MobileMenu';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { notifications, unreadCount, fetchNotifications, markNotificationRead, markAllNotificationsRead, addNotification } = useClubStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;
    fetchNotifications();
    const socket = getSocket();
    socket.emit('join_user', user.id);
    const handler = (data: any) => addNotification(data);
    socket.on('notification', handler);
    return () => { socket.off('notification', handler); };
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Discover', path: '/discover' },
    { name: 'My Books', path: '/library' },
    { name: 'Book Clubs', path: '/clubs' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-[14px] border-b border-border h-16 flex items-center justify-between px-6 md:px-12 select-none">
      <a href="#main-content" className="sr-only focus:not-sr-only absolute top-4 left-4 bg-amber text-white px-4 py-2 rounded-lg font-bold z-[100]">
        Skip to main content
      </a>

      <Link to="/" className="logo text-xl font-black font-serif text-ink tracking-tight flex items-center gap-1">
        Chaptered<span className="text-amber">.</span>
      </Link>

      <div className="hidden md:flex items-center gap-8" aria-label="Desktop Navigation">
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
        </div>

      <div className="flex items-center gap-2">
        {isAuthenticated && user ? (
          <>
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setIsNotifOpen(!isNotifOpen); setIsDropdownOpen(false); }}
              className="relative p-2 text-muted hover:text-ink transition-colors rounded-lg hover:bg-warm/50 cursor-pointer"
              aria-label="Notifications"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] min-h-[18px] leading-none">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-lg py-2 z-50 text-left max-h-96 overflow-y-auto" role="menu">
                <div className="px-4 py-2 border-b border-border/40 flex items-center justify-between">
                  <p className="text-xs font-bold text-ink-soft">Notifications</p>
                  {unreadCount > 0 && (
                    <button onClick={markAllNotificationsRead} className="text-[10px] font-semibold text-amber hover:text-amber-deep">Mark all read</button>
                  )}
                </div>
                {notifications.length === 0 && (
                  <div className="px-4 py-8 text-center">
                    <p className="text-xs text-muted">No notifications yet.</p>
                  </div>
                )}
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => { if (!n.isRead) markNotificationRead(n._id); }}
                    className={`px-4 py-3 cursor-pointer hover:bg-warm/50 transition-colors ${!n.isRead ? 'bg-amber/5 border-l-2 border-l-amber' : ''}`}
                  >
                    <p className="text-xs text-ink-soft font-semibold">{n.message}</p>
                    <p className="text-[10px] text-muted mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
                {notifications.length > 0 && (
                  <Link to="/dashboard" onClick={() => setIsNotifOpen(false)} className="block px-4 py-2.5 border-t border-border/40 text-center text-[11px] font-semibold text-amber hover:text-amber-deep">
                    View all notifications
                  </Link>
                )}
              </div>
            )}
          </div>
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2 rounded-full cursor-pointer"
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
              aria-label="User menu"
            >
              <div className="w-9 h-9 rounded-full bg-amber text-white flex items-center justify-center text-sm font-bold">
                {user.username.charAt(0).toUpperCase()}
              </div>
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-lg py-2 z-50 text-left" role="menu">
                <div className="px-4 py-2 border-b border-border/40">
                  <p className="text-xs font-bold text-ink-soft">{user.username}</p>
                  <p className="text-[10px] text-muted truncate">{user.email}</p>
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
          </>
        ) : (
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-semibold text-muted hover:text-ink transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="btn px-4 py-2 text-sm font-bold rounded-lg shadow-sm"
            >
              Sign Up
            </Link>
          </div>
        )}

        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden flex items-center justify-center p-2 text-ink hover:bg-warm/50 rounded-lg transition-colors cursor-pointer"
          aria-expanded={isMobileMenuOpen}
          aria-label="Toggle Navigation Menu"
        >
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
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
        user={user}
        onLogout={handleLogout}
      />
    </header>
  );
};
