import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export default function ComingSoon({ title }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center px-4">
      <div className="text-6xl">⚽</div>
      <h1 className="text-2xl font-bold font-display">{title || 'Page'}</h1>
      <p className="text-gray-500 dark:text-gray-400">{t('common.coming_soon')}</p>
      <Link to="/" className="btn-primary mt-2">{t('common.back')}</Link>
    </div>
  );
}
