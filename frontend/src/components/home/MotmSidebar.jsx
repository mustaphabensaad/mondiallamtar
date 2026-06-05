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

  // Find the latest match that has a MOTM
  const lastWithMotm = matches.find(m => m.motm_name);

  if (isLoading) return <div className="flex justify-center py-6"><Spinner size="sm" /></div>;
  if (!lastWithMotm) return (
    <p className="text-xs text-gray-400 text-center py-4">{t('common.no_data')}</p>
  );

  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <img
        src={lastWithMotm.motm_photo || `https://placehold.co/80x80/1e40af/ffffff?text=MOM`}
        alt={lastWithMotm.motm_name}
        className="w-20 h-20 rounded-2xl object-cover ring-2 ring-gold"
      />
      <div>
        <p className="font-display font-bold text-sm">{lastWithMotm.motm_name}</p>
        <p className="text-xs text-gray-500 mt-0.5">
          {lastWithMotm.home_team_name} {lastWithMotm.home_score} – {lastWithMotm.away_score} {lastWithMotm.away_team_name}
        </p>
      </div>
      <span className="text-gold text-2xl">⭐</span>
    </div>
  );
}
