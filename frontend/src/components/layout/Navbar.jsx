import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import ThemeToggle from '../ui/ThemeToggle';

export default function Navbar() {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { to: '/',          label: t('nav.home'),      icon: '🏠' },
    { to: '/teams',     label: t('nav.teams'),     icon: '🏟️' },
    { to: '/matches',   label: t('nav.matches'),   icon: '⚽' },
    { to: '/standings', label: t('nav.standings'), icon: '📊' },
    { to: '/bracket',   label: t('nav.bracket'),   icon: '🏆' },
    { to: '/players',   label: t('nav.players', 'Joueurs'), icon: '👤' },
    { to: '/live',      label: t('nav.live'),      icon: '🔴', live: true },
  ];

  function isActive(to) {
    return to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
  }

  function handleLogout() {
    signOut();
    navigate('/');
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0a0f1e]/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* ── Logo ── */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-green-400 flex items-center justify-center text-white font-black text-sm shadow-sm group-hover:scale-105 group-hover:shadow-md group-hover:shadow-primary/30 transition-all duration-200">
            M
          </div>
          <div className="leading-tight">
            <span className="text-[17px] font-black font-display text-gray-900 dark:text-white">Mundial</span>
            <span className="hidden sm:inline text-[11px] font-bold text-gray-400 ml-1.5 uppercase tracking-widest">
              Lamtar 2026
            </span>
          </div>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden lg:flex items-center gap-0.5">
          {navLinks.map(({ to, label, live }) => {
            const active = isActive(to);
            return (
              <Link
                key={to}
                to={to}
                className={`relative px-3.5 py-2 text-sm font-semibold rounded-xl transition-all duration-150
                  ${active
                    ? 'text-primary bg-primary/10'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
              >
                {label}
                {live && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                )}
                {active && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* ── Right controls ── */}
        <div className="flex items-center gap-1.5 shrink-0">
          <LanguageSwitcher />
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-1.5">
              <Link
                to={user.role === 'admin' ? '/admin' : '/captain/dashboard'}
                className="hidden sm:flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300
                           hover:text-primary transition-colors px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black
                  ${user.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-secondary/10 text-secondary dark:text-blue-400'}`}>
                  {user.role === 'admin' ? '⚙' : '⚽'}
                </span>
                <span className="hidden xl:inline">{t('nav.dashboard')}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-semibold px-3 py-2 rounded-xl border border-red-200 dark:border-red-900/60
                           text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <span className="hidden sm:inline">{t('nav.logout')}</span>
                <span className="sm:hidden text-base">🚪</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Link
                to="/login"
                className="text-sm font-semibold px-3.5 py-2 rounded-xl
                           text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="btn-primary text-sm py-2 px-4"
              >
                {t('nav.register')}
              </Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-1"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <svg className="w-5 h-5 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {menuOpen && (
        <nav className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-[#0a0f1e] px-3 py-3 flex flex-col gap-0.5 animate-float-up">
          {navLinks.map(({ to, label, icon, live }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors
                ${isActive(to)
                  ? 'bg-primary/10 text-primary'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                }`}
            >
              <span className="flex items-center gap-3">
                <span>{icon}</span>
                {label}
              </span>
              {live && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
            </Link>
          ))}

          {user ? (
            <>
              <Link
                to={user.role === 'admin' ? '/admin' : '/captain/dashboard'}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-primary bg-primary/5 border border-primary/10 mt-1"
              >
                <span>{user.role === 'admin' ? '⚙️' : '⚽'}</span>
                {t('nav.dashboard')}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <span>🚪</span>{t('nav.logout')}
              </button>
            </>
          ) : (
            <div className="flex gap-2 mt-1 pt-2 border-t border-gray-100 dark:border-gray-800">
              <Link to="/login" onClick={() => setMenuOpen(false)}
                className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                {t('nav.login')}
              </Link>
              <Link to="/register" onClick={() => setMenuOpen(false)}
                className="flex-1 text-center btn-primary text-sm py-2.5">
                {t('nav.register')}
              </Link>
            </div>
          )}
        </nav>
      )}
    </header>
  );
}
