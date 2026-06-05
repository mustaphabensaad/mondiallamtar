import { useQuery } from '@tanstack/react-query';
import { tournamentService } from '../../services/tournament.service';
import Spinner from '../ui/Spinner';

export default function SponsorsSidebar() {
  const { data: sponsors = [], isLoading } = useQuery({
    queryKey: ['sponsors'],
    queryFn:  tournamentService.getSponsors,
  });

  if (isLoading) return <div className="flex justify-center py-6"><Spinner size="sm" /></div>;

  return (
    <div className="flex flex-col gap-3">
      {sponsors.map(s => (
        <a
          key={s.id}
          href={s.website_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl overflow-hidden border border-border-light dark:border-border-dark
                     hover:shadow-md transition-shadow"
        >
          <img
            src={s.logo_path}
            alt={s.name}
            className="w-full h-14 object-cover"
          />
        </a>
      ))}
    </div>
  );
}
