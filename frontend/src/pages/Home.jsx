import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { matchService } from '../services/tournament.service';
import HeroCarousel   from '../components/home/HeroCarousel';
import TodayMatches   from '../components/home/TodayMatches';
import TopScorers     from '../components/home/TopScorers';
import PastMatches    from '../components/home/PastMatches';
import SponsorsSidebar from '../components/home/SponsorsSidebar';
import MotmSidebar    from '../components/home/MotmSidebar';
import MatchCard      from '../components/match/MatchCard';
import Spinner        from '../components/ui/Spinner';

function SectionCard({ title, children }) {
  return (
    <div className="card p-4 sm:p-5">
      <h2 className="font-display font-bold text-base sm:text-lg mb-4
                     border-b border-border-light dark:border-border-dark pb-2
                     text-gray-900 dark:text-gray-100">
        {title}
      </h2>
      {children}
    </div>
  );
}

function LiveBanner() {
  const { t } = useTranslation();
  const { data: liveMatches = [] } = useQuery({
    queryKey: ['matches-live'],
    queryFn:  matchService.getLive,
    refetchInterval: 15_000,
  });
  if (liveMatches.length === 0) return null;
  return (
    <div className="mb-5 flex flex-col gap-3">
      {liveMatches.map(m => <MatchCard key={m.id} match={m} />)}
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 3-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_200px] gap-5">

        {/* Left sidebar — Sponsors */}
        <aside className="order-3 lg:order-1">
          <SectionCard title={t('home.sponsors')}>
            <SponsorsSidebar />
          </SectionCard>
        </aside>

        {/* Main content */}
        <div className="order-1 lg:order-2 flex flex-col gap-5">
          <HeroCarousel />
          <LiveBanner />

          <SectionCard title={t('home.today_matches')}>
            <TodayMatches />
          </SectionCard>

          <SectionCard title={t('home.top_scorers')}>
            <TopScorers limit={8} />
          </SectionCard>

          <SectionCard title={t('home.past_matches')}>
            <PastMatches limit={6} />
          </SectionCard>
        </div>

        {/* Right sidebar — Man of the Match */}
        <aside className="order-2 lg:order-3">
          <SectionCard title={t('home.motm')}>
            <MotmSidebar />
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}
