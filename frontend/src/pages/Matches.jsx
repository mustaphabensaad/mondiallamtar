import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { matchService } from '../services/tournament.service';
import MatchCard from '../components/match/MatchCard';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

const FILTERS = [
  { key: 'all',       labelKey: 'match.all',       icon: '⚽' },
  { key: 'live',      labelKey: 'match.live',      icon: '🔴' },
  { key: 'scheduled', labelKey: 'match.scheduled', icon: '📅' },
  { key: 'finished',  labelKey: 'match.finished_pl', icon: '✓' },
];

export default function Matches() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches', filter],
    queryFn:  () => filter === 'all'
      ? matchService.getAll()
      : matchService.getAll({ status: filter }),
    refetchInterval: filter === 'live' ? 15_000 : false,
  });

  const liveCount = filter === 'live' ? matches.length : 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header mb-0.5">{t('nav.matches')}</h1>
          {!isLoading && (
            <p className="text-sm text-gray-500">
              <span className="font-semibold text-primary">{matches.length}</span> {t('player.registered_count')}
            </p>
          )}
        </div>
        {liveCount > 0 && (
          <span className="live-badge">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            {liveCount} {t('match.live_count')}
          </span>
        )}
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex gap-1.5 mb-6 p-1 bg-gray-100 dark:bg-gray-800/60 rounded-2xl">
        {FILTERS.map(f => {
          const label = t(f.labelKey || '');
          const isActive = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl
                text-sm font-semibold transition-all duration-150
                ${isActive
                  ? 'bg-white dark:bg-[#111827] text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
              <span className={`text-base transition-transform ${isActive ? 'scale-110' : ''}`}>
                {f.icon}
              </span>
              <span className="hidden sm:inline">{label}</span>
              {f.key === 'live' && (
                <span className={`w-1.5 h-1.5 rounded-full bg-red-500 ${isActive ? 'animate-pulse' : ''}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : matches.length === 0 ? (
        <EmptyState
          icon={filter === 'live' ? '🔴' : filter === 'scheduled' ? '📅' : filter === 'finished' ? '🏁' : '⚽'}
          title={
            filter === 'live'      ? t('match.no_live') :
            filter === 'scheduled' ? t('match.no_scheduled') :
            filter === 'finished'  ? t('match.no_results') :
            t('match.no_matches')
          }
          subtitle={
            filter === 'live'      ? t('match.no_live_sub') :
            filter === 'scheduled' ? t('match.no_scheduled_sub') :
            filter === 'finished'  ? t('match.no_results_sub') :
            t('match.no_matches_sub')
          }
          color={filter === 'live' ? 'red' : filter === 'scheduled' ? 'blue' : 'gray'}
          size="lg"
        />
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map((m, i) => (
            <div key={m.id} className="animate-float-up" style={{ animationDelay: `${i * 40}ms` }}>
              <MatchCard match={m} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
