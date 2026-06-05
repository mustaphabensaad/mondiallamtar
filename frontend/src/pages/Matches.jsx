import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { matchService } from '../services/tournament.service';
import MatchCard from '../components/match/MatchCard';
import Spinner from '../components/ui/Spinner';

const FILTERS = ['all', 'live', 'scheduled', 'finished'];

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
      <h1 className="font-display text-2xl font-bold mb-6">{t('nav.matches')}</h1>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {FILTERS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors
              ${filter === f
                ? 'bg-primary text-white'
                : 'bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark hover:border-primary'
              }`}
          >
            {f === 'all' ? t('common.view') + ' all' : t(`match.${f}`)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : matches.length === 0 ? (
        <p className="text-center text-gray-400 py-16">{t('common.no_data')}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {matches.map(m => <MatchCard key={m.id} match={m} />)}
        </div>
      )}
    </div>
  );
}
