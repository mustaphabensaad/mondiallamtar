import { Link } from 'react-router-dom';

const QUICK_LINKS = [
  { to: '/teams',    label: 'Équipes'  },
  { to: '/matches',  label: 'Matchs'   },
  { to: '/standings',label: 'Classement'},
  { to: '/bracket',  label: 'Tableau'  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0f1e] mt-auto">
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-4">

        {/* ── Main row ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">

          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-green-400 flex items-center justify-center text-white font-black text-base shadow-md">
                M
              </div>
              <div>
                <p className="font-display font-black text-gray-900 dark:text-white leading-tight">
                  Mundial Lamtar 2026
                </p>
                <p className="text-[11px] text-gray-400 italic">From us to all – Creativity sans limite</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">
              بطولة كرة قدم جوارية تجمع شباب المنطقة في أجواء رياضية احترافية.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Navigation</p>
            <ul className="space-y-2">
              {QUICK_LINKS.map(l => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary transition-colors font-medium flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 rounded-full bg-primary/50" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Contact</p>
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
                <span className="text-xs">0670 062 056</span>
              </li>
              <li className="mt-3">
                <Link to="/terms"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors">
                  📋 Règlement du tournoi
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
            <span>
              طبعة الوفاء — تُهدى إلى روح الشهيد الطيار{' '}
              <strong className="text-amber-700 dark:text-amber-300">بن نجة يوسف</strong>
            </span>
          </div>
          <p className="text-gray-400">
            © {year} مونديال لمطار · Tous droits réservés
          </p>
        </div>
      </div>
    </footer>
  );
}
