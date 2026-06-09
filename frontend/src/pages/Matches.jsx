import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { matchService } from '../services/tournament.service';
import MatchCard from '../components/match/MatchCard';
import Spinner from '../components/ui/Spinner';

const FILTERS = [
  { key: 'all',       label: 'Tous',    icon: '⚽' },
  { key: 'live',      label: null,      icon: '🔴' },
  { key: 'scheduled', label: null,      icon: '📅' },
  { key: 'finished',  label: null,      icon: '✓'  },
];

export default function Matches() {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all');

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches', filter],
    queryFn:  () => filter === 'all' ? matchService.getAll() : matchService.getAll({ status: filter }),
    refetchInterval: filter === 'live' ? 15_000 : false,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-header mb-0">{t('nav.matches')}</h1>
        {filter === 'live' && matches.length > 0 && (
          <span className="live-badge">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            {matches.length} en direct
          </span>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-800/60 rounded-2xl">
        {FILTERS.map(f => {
          const label = f.label || t(`match.${f.key}`);
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-150
                ${filter === f.key
                  ? 'bg-white dark:bg-[#111827] text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
            >
              <span className="text-base">{f.icon}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : matches.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">🏟️</p>
          <p className="text-gray-500 font-semibold">{t('common.no_data')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map(m => <MatchCard key={m.id} match={m} />)}
        </div>
      )}
    </div>
  );
}
