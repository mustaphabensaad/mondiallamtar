import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { matchService } from '../../services/tournament.service';
import MatchCard from '../match/MatchCard';
import Spinner from '../ui/Spinner';
import EmptyState from '../ui/EmptyState';

export default function TodayMatches() {
  const { t } = useTranslation();
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches-today'],
    queryFn:  matchService.getToday,
    refetchInterval: 30_000,
  });

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  if (matches.length === 0) return (
    <EmptyState
      icon="📅"
      title={t('home.no_today_title')}
      subtitle={t('home.no_today_sub')}
      color="blue"
      size="sm"
    />
  );

  return (
    <div className="flex flex-col gap-3">
      {matches.map(m => <MatchCard key={m.id} match={m} />)}
    </div>
  );
}
