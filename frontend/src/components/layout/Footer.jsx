import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[#0a0f1e] mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-green-400 flex items-center justify-center text-white font-black text-sm shadow-sm">
              M
            </div>
            <div>
              <p className="font-display font-black text-gray-900 dark:text-white leading-tight">Mundial Lamtar 2026</p>
              <p className="text-[10px] text-gray-400 italic">From us to all – Creativity sans limite</p>
            </div>
          </div>

          {/* Links */}
          <div className="flex items-center gap-4 text-gray-500 dark:text-gray-400">
            <Link to="/terms" className="hover:text-primary transition-colors text-xs font-medium">Règlement</Link>
            <a href="mailto:mundiallamtar.contact@gmail.com" className="hover:text-primary transition-colors text-xs font-medium">Contact</a>
            <span className="text-xs font-semibold text-primary">@Mundial22024</span>
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} مونديال لمطار</p>
        </div>

        {/* Tribute bar */}
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-xs text-amber-600 dark:text-amber-400">
            🦅 طبعة الوفاء — تُهدى إلى روح الشهيد الطيار <strong>بن نجة يوسف</strong>
          </p>
        </div>
      </div>
    </footer>
  );
}
