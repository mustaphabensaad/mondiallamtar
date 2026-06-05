import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { matchService } from '../../services/tournament.service';
import MatchCard from '../match/MatchCard';
import Spinner from '../ui/Spinner';

export default function TodayMatches() {
  const { t } = useTranslation();
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches-today'],
    queryFn:  matchService.getToday,
    refetchInterval: 30_000,
  });

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : matches.length === 0 ? (
        <p className="text-center text-gray-400 py-8 text-sm">{t('common.no_data')}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map(m => <MatchCard key={m.id} match={m} />)}
        </div>
      )}
    </div>
  );
}
