import { useQuery } from '@tanstack/react-query';
import { matchService } from '../../services/tournament.service';
import MatchCard from '../match/MatchCard';
import Spinner from '../ui/Spinner';
import EmptyState from '../ui/EmptyState';

export default function TodayMatches() {
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches-today'],
    queryFn:  matchService.getToday,
    refetchInterval: 30_000,
  });

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  if (matches.length === 0) return (
    <EmptyState
      icon="📅"
      title="Pas de match aujourd'hui"
      subtitle="Revenez bientôt — les matchs apparaîtront ici dès qu'ils seront programmés."
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
