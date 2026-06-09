import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { playerService } from '../../services/tournament.service';
import Spinner from '../ui/Spinner';

const MEDALS = ['🥇', '🥈', '🥉'];
const MEDAL_BG = [
  'bg-gradient-to-br from-yellow-400/20 to-amber-500/10 border-yellow-400/30',
  'bg-gradient-to-br from-gray-300/20 to-gray-400/10 border-gray-300/30',
  'bg-gradient-to-br from-amber-600/20 to-orange-500/10 border-amber-600/30',
];

export default function TopScorers({ limit = 8 }) {
  const { t } = useTranslation();
  const { data: scorers = [], isLoading } = useQuery({
    queryKey: ['top-scorers', limit],
    queryFn:  () => playerService.getTopScorers(limit),
  });

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;
  if (scorers.length === 0) return (
    <p className="text-center text-gray-400 py-6 text-sm">{t('common.no_data')}</p>
  );

  const top3 = scorers.slice(0, 3);
  const rest = scorers.slice(3);

  return (
    <div>
      {/* Podium top-3 */}
      {top3.length > 0 && (
        <div className="flex gap-2 mb-4">
          {top3.map((p, i) => (
            <div
              key={p.id}
              className={`flex-1 rounded-2xl border p-3 text-center ${MEDAL_BG[i]}`}
            >
              <div className="text-xl mb-1">{MEDALS[i]}</div>
              <img
                src={p.photo_path || `https://placehold.co/48x48/1e40af/ffffff?text=${encodeURIComponent((p.first_name||'?')[0])}`}
                alt={`${p.first_name} ${p.last_name}`}
                className="w-12 h-12 rounded-full object-cover mx-auto mb-2 shadow-md ring-2 ring-white/20"
              />
              <p className="text-xs font-bold leading-tight line-clamp-2">
                {p.first_name} {p.last_name}
              </p>
              <p className="text-[10px] text-gray-500 mt-0.5 truncate">{p.team_name}</p>
              <div className="mt-2 flex items-center justify-center gap-1">
                <span className="text-xl font-black text-primary">{p.goals}</span>
                <span className="text-sm">⚽</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rest of scorers */}
      {rest.length > 0 && (
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {rest.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3 py-2.5">
              <span className="w-6 text-center text-xs font-black text-gray-400 shrink-0">{i + 4}</span>
              <img
                src={p.photo_path || `https://placehold.co/36x36/1e40af/ffffff?text=${encodeURIComponent((p.first_name||'?')[0])}`}
                alt={`${p.first_name} ${p.last_name}`}
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{p.first_name} {p.last_name}</p>
                <p className="text-xs text-gray-500 truncate">{p.team_name}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-base font-black text-primary">{p.goals}</span>
                <span className="text-xs text-gray-400">⚽</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
