import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { matchService } from '../services/tournament.service';
import HeroCarousel    from '../components/home/HeroCarousel';
import TodayMatches    from '../components/home/TodayMatches';
import TopScorers      from '../components/home/TopScorers';
import PastMatches     from '../components/home/PastMatches';
import SponsorsSidebar from '../components/home/SponsorsSidebar';
import MotmSidebar     from '../components/home/MotmSidebar';
import PostsFeed       from '../components/home/PostsFeed';
import MatchCard       from '../components/match/MatchCard';

function SectionCard({ title, icon, children, accent, className = '' }) {
  return (
    <div className={`bg-white dark:bg-[#111827] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm ${className}`}>
      <div className={`flex items-center gap-2.5 px-4 sm:px-5 py-3 border-b border-gray-100 dark:border-gray-800/80 ${accent || ''}`}>
        {icon && (
          <span className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-sm shrink-0">
            {icon}
          </span>
        )}
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
  const { t } = useTranslation();
  const { data: liveMatches = [] } = useQuery({
    queryKey: ['matches-live'],
    queryFn:  matchService.getLive,
    refetchInterval: 15_000,
  });
  if (liveMatches.length === 0) return null;

  return (
    <div className="rounded-2xl border border-red-600/40 bg-gradient-to-br from-red-950/20 to-gray-900/10 dark:from-red-950/40 dark:to-transparent overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-red-700/30 bg-red-600/10">
        <span className="live-badge text-[10px] px-2 py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-white" />
          {t('match.live')}
        </span>
        <span className="text-xs font-semibold text-red-500">{t(liveMatches.length > 1 ? 'home.live_matches_pl' : 'home.live_matches', { count: liveMatches.length })}</span>
      </div>
      <div className="p-3 flex flex-col gap-3">
        {liveMatches.map(m => <MatchCard key={m.id} match={m} />)}
      </div>
    </div>
  );
}

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr_200px] gap-5">

        {/* ── Left sidebar: Sponsors ── */}
        <aside className="order-3 lg:order-1 space-y-4">
          <SectionCard title={t('home.sponsors')} icon="🤝">
            <SponsorsSidebar />
          </SectionCard>
        </aside>

        {/* ── Main column ── */}
        <div className="order-1 lg:order-2 flex flex-col gap-5 min-w-0">
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

        {/* ── Right sidebar: MOTM ── */}
        <aside className="order-2 lg:order-3 space-y-4">
          <SectionCard title={t('home.motm')} icon="⭐">
            <MotmSidebar />
          </SectionCard>
        </aside>

      </div>

      {/* ── Actualités — full width below grid ── */}
      <div className="mt-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-base shrink-0">📰</span>
          <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white">{t('home.posts_title')}</h2>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
        </div>
        <PostsFeed />
      </div>
    </div>
  );
}
