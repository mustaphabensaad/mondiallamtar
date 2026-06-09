import { useQuery } from '@tanstack/react-query';
import { matchService } from '../../services/tournament.service';
import MatchCard from '../match/MatchCard';
import Spinner from '../ui/Spinner';
import EmptyState from '../ui/EmptyState';

export default function PastMatches({ limit = 6 }) {
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches-finished', limit],
    queryFn:  () => matchService.getAll({ status: 'finished', limit }),
  });

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  if (matches.length === 0) return (
    <EmptyState
      icon="🏁"
      title="Aucun résultat pour l'instant"
      subtitle="Les résultats des matchs terminés s'afficheront ici."
      color="gray"
      size="sm"
    />
  );

  return (
    <div className="flex flex-col gap-3">
      {matches.map(m => <MatchCard key={m.id} match={m} compact />)}
    </div>
  );
}
