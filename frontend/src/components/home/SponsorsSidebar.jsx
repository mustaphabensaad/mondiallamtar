import { useQuery } from '@tanstack/react-query';
import { tournamentService } from '../../services/tournament.service';
import Spinner from '../ui/Spinner';

const TIER_CONFIG = {
  gold: {
    label:     'Partenaire Or',
    icon:      '🥇',
    headerBg:  'bg-gradient-to-r from-yellow-500/15 to-amber-400/10',
    headerText:'text-yellow-600 dark:text-yellow-400',
    border:    'border-yellow-400/50 dark:border-yellow-600/40',
    cardBg:    'bg-gradient-to-br from-yellow-50 to-amber-50/80 dark:from-yellow-900/20 dark:to-amber-900/10',
    shadow:    'shadow-yellow-200/60 dark:shadow-yellow-900/20',
    glowHover: 'hover:shadow-yellow-300/50 dark:hover:shadow-yellow-700/30',
    logoH:     'h-14',
    nameColor: 'text-yellow-700 dark:text-yellow-500',
    ring:      'ring-yellow-300/40',
  },
  silver: {
    label:     'Partenaire Argent',
    icon:      '🥈',
    headerBg:  'bg-gradient-to-r from-slate-300/20 to-gray-200/10',
    headerText:'text-slate-500 dark:text-slate-400',
    border:    'border-slate-300/60 dark:border-slate-600/40',
    cardBg:    'bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-800/30 dark:to-gray-800/20',
    shadow:    'shadow-slate-200/60 dark:shadow-slate-700/20',
    glowHover: 'hover:shadow-slate-300/40',
    logoH:     'h-10',
    nameColor: 'text-slate-600 dark:text-slate-400',
    ring:      'ring-slate-300/40',
  },
  bronze: {
    label:     'Partenaire Bronze',
    icon:      '🥉',
    headerBg:  'bg-gradient-to-r from-orange-400/15 to-amber-300/10',
    headerText:'text-orange-600 dark:text-orange-500',
    border:    'border-orange-300/50 dark:border-orange-700/40',
    cardBg:    'bg-gradient-to-br from-orange-50 to-amber-50/60 dark:from-orange-900/15 dark:to-amber-900/10',
    shadow:    'shadow-orange-100/60 dark:shadow-orange-900/15',
    glowHover: 'hover:shadow-orange-200/50',
    logoH:     'h-8',
    nameColor: 'text-orange-600 dark:text-orange-500',
    ring:      'ring-orange-300/40',
  },
};

function SponsorCard({ sponsor, isGold }) {
  const cfg = TIER_CONFIG[sponsor.tier] || TIER_CONFIG.bronze;
  return (
    <a
      href={sponsor.website_url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      title={`${sponsor.name} — Visiter le site`}
      className={`
        block rounded-xl overflow-hidden border-2 shadow-sm
        ${cfg.border} ${cfg.cardBg} ${cfg.shadow} ${cfg.glowHover}
        hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group
        ${isGold ? 'ring-1 ' + cfg.ring : ''}
      `}
    >
      {/* Logo */}
      <div className={`flex items-center justify-center px-3 ${isGold ? 'pt-3 pb-2' : 'py-2'}`}>
        <img
          src={sponsor.logo_path || `https://placehold.co/160x60/e5e7eb/6b7280?text=${encodeURIComponent(sponsor.name || '?')}`}
          alt={sponsor.name}
          className={`w-full ${cfg.logoH} object-contain group-hover:scale-105 transition-transform duration-200`}
          onError={e => { e.target.src = `https://placehold.co/160x40/f3f4f6/9ca3af?text=${encodeURIComponent(sponsor.name || '?')}`; }}
        />
      </div>

      {/* Name */}
      <div className={`pb-2 px-2 text-center ${isGold ? '' : 'pt-0.5'}`}>
        <p className={`text-[10px] font-black truncate ${cfg.nameColor}`}>
          {sponsor.name}
        </p>
        {isGold && sponsor.website_url && (
          <p className="text-[9px] text-gray-400 truncate mt-0.5 opacity-70">
            {sponsor.website_url.replace(/^https?:\/\/(www\.)?/, '')}
          </p>
        )}
      </div>
    </a>
  );
}

function TierSection({ tier, sponsors }) {
  if (!sponsors.length) return null;
  const cfg = TIER_CONFIG[tier];
  const isGold = tier === 'gold';

  return (
    <div>
      {/* Tier header */}
      <div className={`flex items-center gap-1.5 rounded-lg px-2 py-1 mb-2 ${cfg.headerBg}`}>
        <span className="text-sm leading-none">{cfg.icon}</span>
        <span className={`text-[9px] font-black uppercase tracking-[0.12em] ${cfg.headerText}`}>
          {cfg.label}
        </span>
        <span className={`ml-auto text-[9px] font-bold ${cfg.headerText} opacity-60`}>
          {sponsors.length}
        </span>
      </div>

      {/* Cards */}
      <div className={`flex flex-col gap-1.5 ${isGold ? 'gap-2' : 'gap-1.5'}`}>
        {sponsors.map(s => (
          <SponsorCard key={s.id} sponsor={s} isGold={isGold} />
        ))}
      </div>
    </div>
  );
}

export default function SponsorsSidebar() {
  const { data: sponsors = [], isLoading } = useQuery({
    queryKey: ['sponsors'],
    queryFn:  tournamentService.getSponsors,
  });

  if (isLoading) return (
    <div className="flex justify-center py-6"><Spinner size="sm" /></div>
  );

  if (sponsors.length === 0) return (
    <div className="flex flex-col items-center gap-2 py-6 text-center">
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-100 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/20 flex items-center justify-center text-2xl border border-amber-200/50 dark:border-amber-700/30">
        🤝
      </div>
      <div>
        <p className="text-[11px] font-bold text-gray-500 dark:text-gray-400">Partenaires à venir</p>
        <p className="text-[10px] text-gray-400 mt-0.5">Contactez-nous pour sponsoriser</p>
      </div>
    </div>
  );

  const gold   = sponsors.filter(s => s.tier === 'gold');
  const silver = sponsors.filter(s => s.tier === 'silver');
  const bronze = sponsors.filter(s => s.tier === 'bronze');

  return (
    <div className="flex flex-col gap-4">
      <TierSection tier="gold"   sponsors={gold}   />
      <TierSection tier="silver" sponsors={silver} />
      <TierSection tier="bronze" sponsors={bronze} />
    </div>
  );
}
