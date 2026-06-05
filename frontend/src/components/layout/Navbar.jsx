import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import ThemeToggle from '../ui/ThemeToggle';

export default function Navbar() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: '/',          label: t('nav.home') },
    { to: '/teams',     label: t('nav.teams') },
    { to: '/matches',   label: t('nav.matches') },
    { to: '/standings', label: t('nav.standings') },
    { to: '/bracket',   label: t('nav.bracket') },
    { to: '/live',      label: t('nav.live') },
  ];

  function handleLogout() {
    signOut();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-surface-dark/90 backdrop-blur-md border-b border-border-light dark:border-border-dark">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl font-black font-display text-primary">Shabka</span>
          <span className="hidden sm:block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Tournament
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300
                         hover:text-primary dark:hover:text-primary rounded-lg
                         hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right section */}
        <div className="flex items-center gap-2 shrink-0">
          <LanguageSwitcher />
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to={user.role === 'admin' ? '/admin' : '/captain/dashboard'}
                className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300
                           hover:text-primary transition-colors px-3 py-2"
              >
                {t('nav.dashboard')}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-semibold px-4 py-2 rounded-xl border border-red-400
                           text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm font-semibold px-4 py-2 rounded-xl
                           text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="text-sm font-semibold px-4 py-2 rounded-xl
                           bg-primary hover:bg-primary-dark text-white transition-colors"
              >
                {t('nav.register')}
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav className="lg:hidden border-t border-border-light dark:border-border-dark px-4 py-3 flex flex-col gap-1 bg-white dark:bg-surface-dark">
          {navLinks.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className="px-3 py-2 text-sm font-medium rounded-lg
                         hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
