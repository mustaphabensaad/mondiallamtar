import { useQuery } from '@tanstack/react-query';
import { tournamentService } from '../../services/tournament.service';
import Spinner from '../ui/Spinner';

export default function SponsorsSidebar() {
  const { data: sponsors = [], isLoading } = useQuery({
    queryKey: ['sponsors'],
    queryFn:  tournamentService.getSponsors,
  });

  if (isLoading) return <div className="flex justify-center py-6"><Spinner size="sm" /></div>;
  if (sponsors.length === 0) return (
    <p className="text-xs text-gray-400 text-center py-4">—</p>
  );

  return (
    <div className="flex flex-col gap-2.5">
      {sponsors.map(s => (
        <a
          key={s.id}
          href={s.website_url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800
                     hover:border-primary/40 hover:shadow-md transition-all duration-200 group"
        >
          <div className="bg-white dark:bg-[#111827] p-2">
            <img
              src={s.logo_path}
              alt={s.name}
              className="w-full h-12 object-contain group-hover:scale-105 transition-transform duration-200"
            />
          </div>
          {s.name && (
            <p className="text-[10px] text-center text-gray-400 py-1 bg-gray-50 dark:bg-gray-800 truncate px-2">
              {s.name}
            </p>
          )}
        </a>
      ))}
    </div>
  );
}
