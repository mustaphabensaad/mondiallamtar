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

function SectionCard({ title, icon, children, accent }) {
  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">
      <div className={`flex items-center gap-2.5 px-4 sm:px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 ${accent || ''}`}>
        {icon && <span className="text-base">{icon}</span>}
        <h2 className="font-display font-bold text-sm sm:text-base text-gray-900 dark:text-white">
          {title}
        </h2>
      </div>
      <div className="p-4 sm:p-5">
        {children}
      </div>
    </div>
  );
}

function LiveBanner() {
  const { data: liveMatches = [] } = useQuery({
    queryKey: ['matches-live'],
    queryFn:  matchService.getLive,
    refetchInterval: 15_000,
  });
  if (liveMatches.length === 0) return null;
  return (
    <div className="flex flex-col gap-3">
      {liveMatches.map(m => <MatchCard key={m.id} match={m} />)}
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[190px_1fr_190px] gap-5">

        {/* Left sidebar — Sponsors */}
        <aside className="order-3 lg:order-1 space-y-5">
          <SectionCard title={t('home.sponsors')} icon="🤝">
            <SponsorsSidebar />
          </SectionCard>
        </aside>

        {/* Main */}
        <div className="order-1 lg:order-2 flex flex-col gap-5">
          <HeroCarousel />
          <LiveBanner />

          <SectionCard title={t('home.today_matches')} icon="📅">
            <TodayMatches />
          </SectionCard>

          <SectionCard title={t('home.top_scorers')} icon="🥇">
            <TopScorers limit={8} />
          </SectionCard>

          <SectionCard title={t('home.past_matches')} icon="🕐">
            <PastMatches limit={6} />
          </SectionCard>
        </div>

        {/* Right sidebar — MOTM */}
        <aside className="order-2 lg:order-3 space-y-5">
          <SectionCard title={t('home.motm')} icon="⭐">
            <MotmSidebar />
          </SectionCard>
        </aside>

      </div>
    </div>
  );
}
