import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const QUICK_LINKS = [
  { to: '/teams',     labelKey: 'nav.teams'     },
  { to: '/matches',   labelKey: 'nav.matches'   },
  { to: '/standings', labelKey: 'nav.standings' },
  { to: '/bracket',   labelKey: 'nav.bracket'   },
];

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0f1e] mt-auto">
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-4">

        {/* ── Main row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">

          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Mundial Lamtar 2026"
                className="w-10 h-10 rounded-xl object-cover shadow-md"
              />
              <div>
                <p className="font-display font-black text-gray-900 dark:text-white leading-tight">
                  Mundial Lamtar 2026
                </p>
                <p className="text-[11px] text-gray-400 italic">{t('footer.slogan')}</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">
              {t('footer.desc')}
            </p>
          </div>

          {/* Quick links */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">{t('footer.nav_title')}</p>
            <ul className="space-y-2">
              {QUICK_LINKS.map(l => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors font-medium flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 rounded-full bg-primary/50" />
                    {t(l.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">{t('footer.contact_title')}</p>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center gap-2">
                <span>📧</span>
                <a href="mailto:mundiallamtar.contact@gmail.com"
                   className="hover:text-primary transition-colors break-all text-xs">
                  mundiallamtar.contact@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span>📱</span>
                <span className="text-xs">0665 18 15 13</span>
              </li>
              <li className="mt-3">
                <Link to="/terms"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors">
                  📋 {t('footer.rules_btn')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent mb-4" />

        {/* ── Tribute bar ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium">
            <span className="text-base">🦅</span>
            <span>{t('footer.tribute')}</span>
          </div>
          <p className="text-gray-400">
            © {year} مونديال لمطار · {t('footer.rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}
