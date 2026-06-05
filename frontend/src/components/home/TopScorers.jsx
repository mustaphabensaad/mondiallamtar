import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { playerService } from '../../services/tournament.service';
import Spinner from '../ui/Spinner';

export default function TopScorers({ limit = 8 }) {
  const { t } = useTranslation();
  const { data: scorers = [], isLoading } = useQuery({
    queryKey: ['top-scorers', limit],
    queryFn:  () => playerService.getTopScorers(limit),
  });

  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : scorers.length === 0 ? (
        <p className="text-center text-gray-400 py-6 text-sm">{t('common.no_data')}</p>
      ) : (
        <div className="divide-y divide-border-light dark:divide-border-dark">
          {scorers.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 py-2.5">
              {/* Rank */}
              <span className={`w-6 text-center text-xs font-black shrink-0
                ${i === 0 ? 'text-gold' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-gray-400'}`}>
                {i + 1}
              </span>
              {/* Photo */}
              <img
                src={p.photo_path || `https://placehold.co/40x40/1e40af/ffffff?text=${encodeURIComponent((p.first_name||'?')[0])}`}
                alt={`${p.first_name} ${p.last_name}`}
                className="w-9 h-9 rounded-full object-cover shrink-0"
              />
              {/* Name + team */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{p.first_name} {p.last_name}</p>
                <p className="text-xs text-gray-500 truncate">{p.team_name}</p>
              </div>
              {/* Goals */}
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-lg font-black text-primary">{p.goals}</span>
                <span className="text-xs text-gray-400">⚽</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
