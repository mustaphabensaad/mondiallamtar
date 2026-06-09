import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { matchService } from '../../services/tournament.service';
import Spinner from '../ui/Spinner';

export default function MotmSidebar() {
  const { t } = useTranslation();
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches-motm'],
    queryFn:  () => matchService.getAll({ status: 'finished', limit: 5 }),
  });

  const last = matches.find(m => m.motm_name);

  if (isLoading) return <div className="flex justify-center py-6"><Spinner size="sm" /></div>;
  if (!last) return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <span className="text-3xl">⭐</span>
      <p className="text-xs text-gray-400">{t('common.no_data')}</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      {/* Glow ring */}
      <div className="relative">
        <div className="absolute inset-0 rounded-2xl bg-gold/20 blur-xl scale-110 pointer-events-none" />
        <img
          src={last.motm_photo || `https://placehold.co/96x96/1e40af/ffffff?text=⭐`}
          alt={last.motm_name}
          className="relative w-24 h-24 rounded-2xl object-cover ring-2 ring-gold shadow-lg"
        />
        <span className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center text-sm shadow-md">
          ⭐
        </span>
      </div>

      <div>
        <p className="font-display font-black text-sm text-gray-900 dark:text-white">{last.motm_name}</p>
        <p className="text-xs text-gray-500 mt-0.5 leading-tight">
          {last.home_team_name} {last.home_score}–{last.away_score} {last.away_team_name}
        </p>
      </div>

      <span className="text-[10px] font-bold uppercase tracking-widest text-gold bg-gold/10 px-3 py-1 rounded-full border border-gold/20">
        {t('home.motm')}
      </span>
    </div>
  );
}
