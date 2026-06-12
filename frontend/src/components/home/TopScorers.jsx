import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { playerService } from '../../services/tournament.service';
import Spinner from '../ui/Spinner';
import EmptyState from '../ui/EmptyState';

const PODIUM = [
  {
    medal: '🥇', rank: 1,
    bg: 'bg-gradient-to-b from-yellow-400/25 to-amber-500/10',
    border: 'border-yellow-400/40',
    glow: 'shadow-[0_4px_20px_-4px_rgba(251,191,36,0.35)]',
    ring: 'ring-2 ring-yellow-400/60 ring-offset-1',
    numColor: 'text-yellow-500',
    height: 'mt-0',      /* tallest — no top margin */
  },
  {
    medal: '🥈', rank: 2,
    bg: 'bg-gradient-to-b from-gray-300/20 to-gray-400/10',
    border: 'border-gray-300/30',
    glow: '',
    ring: 'ring-2 ring-gray-300/50 ring-offset-1',
    numColor: 'text-gray-400',
    height: 'mt-4',
  },
  {
    medal: '🥉', rank: 3,
    bg: 'bg-gradient-to-b from-orange-400/20 to-amber-600/10',
    border: 'border-orange-400/30',
    glow: '',
    ring: 'ring-2 ring-orange-400/50 ring-offset-1',
    numColor: 'text-orange-500',
    height: 'mt-6',
  },
];

export default function TopScorers({ limit = 8 }) {
  const { t } = useTranslation();
  const { data: scorers = [], isLoading } = useQuery({
    queryKey: ['top-scorers', limit],
    queryFn:  () => playerService.getTopScorers(limit),
  });

  if (isLoading) return (
    <div className="flex justify-center py-8"><Spinner /></div>
  );
  if (scorers.length === 0) return (
    <EmptyState
      icon="⚽"
      title={t('home.no_scorers_title')}
      subtitle={t('home.no_scorers_sub')}
      color="green"
      size="sm"
    />
  );

  // Reorder for podium display: 2nd, 1st, 3rd
  const top3Raw = scorers.slice(0, 3);
  const podiumOrder = [
    top3Raw[1] ? { ...top3Raw[1], podium: PODIUM[1] } : null,
    top3Raw[0] ? { ...top3Raw[0], podium: PODIUM[0] } : null,
    top3Raw[2] ? { ...top3Raw[2], podium: PODIUM[2] } : null,
  ].filter(Boolean);

  const rest = scorers.slice(3);

  return (
    <div>
      {/* ── Podium ── */}
      {top3Raw.length > 0 && (
        <div className="flex items-end gap-2 mb-5 px-1">
          {podiumOrder.map((p) => {
            const { podium } = p;
            return (
              <div
                key={p.id}
                className={`flex-1 rounded-2xl border ${podium.bg} ${podium.border} ${podium.glow} ${podium.height}
                  p-3 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg`}
              >
                <div className="text-2xl mb-2 leading-none">{podium.medal}</div>

                <div className="relative inline-block">
                  <img
                    src={p.photo_path || `https://placehold.co/56x56/1e40af/ffffff?text=${encodeURIComponent((p.first_name || '?')[0])}`}
                    alt={`${p.first_name} ${p.last_name}`}
                    className={`w-14 h-14 rounded-2xl object-cover mx-auto shadow-md
                      ${podium.ring} ring-offset-white dark:ring-offset-[#111827]`}
                  />
                  {podium.rank === 1 && (
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-base">🔥</span>
                  )}
                </div>

                <p className="text-xs font-black leading-tight mt-2 line-clamp-2 text-gray-900 dark:text-white">
                  {p.first_name} {p.last_name}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5 truncate">{p.team_name}</p>

                <div className={`mt-2 flex items-center justify-center gap-1 font-black ${podium.numColor}`}>
                  <span className="text-2xl tabular-nums">{p.goals}</span>
                  <span className="text-sm text-gray-500">⚽</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Rest ── */}
      {rest.length > 0 && (
        <div className="rounded-xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-50 dark:divide-gray-800 overflow-hidden">
          {rest.map((p, i) => (
            <div key={p.id}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
              <span className="w-5 text-center text-xs font-black text-gray-400 shrink-0 tabular-nums">
                {i + 4}
              </span>
              <img
                src={p.photo_path || `https://placehold.co/32x32/1e40af/ffffff?text=${encodeURIComponent((p.first_name || '?')[0])}`}
                alt={`${p.first_name} ${p.last_name}`}
                className="w-8 h-8 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-gray-900 dark:text-gray-100">
                  {p.first_name} {p.last_name}
                </p>
                <p className="text-[11px] text-gray-500 truncate">{p.team_name}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-base font-black text-primary tabular-nums">{p.goals}</span>
                <span className="text-xs">⚽</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
