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

  if (isLoading) return (
    <div className="flex justify-center py-8"><Spinner size="sm" /></div>
  );

  if (!last) return (
    <div className="flex flex-col items-center gap-3 py-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
        <span className="text-3xl">⭐</span>
      </div>
      <p className="text-xs text-gray-400 font-medium">{t('common.no_data')}</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4 text-center py-1">
      {/* Photo with glow */}
      <div className="relative">
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-400/30 to-amber-600/20 blur-xl scale-125 pointer-events-none" />

        <img
          src={last.motm_photo || `https://placehold.co/96x96/1e3a8a/ffffff?text=${encodeURIComponent((last.motm_name || '?')[0])}`}
          alt={last.motm_name}
          className="relative w-24 h-24 rounded-2xl object-cover shadow-xl ring-2 ring-amber-400/70 ring-offset-2 ring-offset-white dark:ring-offset-[#111827]"
        />

        {/* Badge */}
        <span className="absolute -bottom-2.5 -right-2.5 w-9 h-9 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center text-base shadow-lg border-2 border-white dark:border-[#111827]">
          ⭐
        </span>
      </div>

      {/* Name + match */}
      <div className="space-y-1">
        <p className="font-display font-black text-sm text-gray-900 dark:text-white leading-tight">
          {last.motm_name}
        </p>
        <p className="text-[11px] text-gray-500 leading-snug">
          {last.home_team_name}
          <span className="mx-1 font-bold text-gray-700 dark:text-gray-300">
            {last.home_score}–{last.away_score}
          </span>
          {last.away_team_name}
        </p>
      </div>

      {/* Label pill */}
      <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/10 to-yellow-400/10 border border-amber-400/30 px-3 py-1.5 rounded-full">
        <span className="text-xs">🏆</span>
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
          {t('home.motm')}
        </span>
      </div>
    </div>
  );
}
