import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { matchService } from '../../services/tournament.service';
import MatchCard from '../match/MatchCard';
import Spinner from '../ui/Spinner';
import EmptyState from '../ui/EmptyState';
import ShareCardModal from '../share/ShareCardModal';
import TodayMatchesCard from '../share/cards/TodayMatchesCard';

export default function TodayMatches() {
  const { t } = useTranslation();
  const [showExport, setShowExport] = useState(false);

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches-today'],
    queryFn:  matchService.getToday,
    refetchInterval: 30_000,
  });

  if (isLoading) return <div className="flex justify-center py-8"><Spinner /></div>;

  if (matches.length === 0) return (
    <EmptyState
      icon="📅"
      title={t('home.no_today_title')}
      subtitle={t('home.no_today_sub')}
      color="blue"
      size="sm"
    />
  );

  return (
    <>
      <div className="flex flex-col gap-3">
        {matches.map(m => <MatchCard key={m.id} match={m} />)}
      </div>

      {/* Export button */}
      <div className="flex justify-end mt-3">
        <button
          onClick={() => setShowExport(true)}
          className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
        >
          📤 {t('share.export_card', { defaultValue: 'Exporter la carte' })}
        </button>
      </div>

      <ShareCardModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        title={t('home.today_matches', { defaultValue: "Programme du jour" })}
        filename="programme-du-jour.png"
      >
        <TodayMatchesCard matches={matches} />
      </ShareCardModal>
    </>
  );
}
