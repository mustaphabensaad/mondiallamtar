import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border-light dark:border-border-dark bg-white dark:bg-surface-dark mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500 dark:text-gray-400">
        <p className="font-display font-bold text-primary text-base">Shabka Tournament</p>
        <div className="flex items-center gap-4">
          <Link to="/terms" className="hover:text-primary transition-colors">
            {t('common.terms', 'Terms')}
          </Link>
        </div>
        <p>© {new Date().getFullYear()} Shabka</p>
      </div>
    </footer>
  );
}
