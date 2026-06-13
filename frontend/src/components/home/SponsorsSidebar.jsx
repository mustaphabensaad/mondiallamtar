import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { tournamentService } from '../../services/tournament.service';
import Spinner from '../ui/Spinner';

/* ─── helpers ─────────────────────────────────────────────── */
function placeholder(name, w, h, bg, fg) {
  return `https://placehold.co/${w}x${h}/${bg}/${fg}?text=${encodeURIComponent(name || '?')}`;
}

/* ──────────────────────────────────────────────────────────── *
 *  GOLD — full-bleed cinematic hero                           *
 * ──────────────────────────────────────────────────────────── */
function GoldHero({ sponsor }) {
  return (
    <a
      href={sponsor.website_url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="block group relative overflow-hidden rounded-2xl"
    >
      {/* ambient glow layer */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-400/30 via-yellow-500/10 to-transparent blur-2xl scale-110 pointer-events-none" />

      {/* card */}
      <div
        className="
          relative z-10
          bg-gradient-to-br from-[#1a1200] to-[#0d0900]
          rounded-2xl overflow-hidden
          ring-1 ring-yellow-500/30
          group-hover:ring-yellow-400/60
          transition-all duration-500
        "
      >
        {/* top strip */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-80" />

        {/* logo area */}
        <div className="flex items-center justify-center px-6 py-6 min-h-[80px]">
          <img
            src={sponsor.logo_path || placeholder(sponsor.name, 160, 64, '1a1200', 'eab308')}
            alt={sponsor.name}
            className="max-h-16 w-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_12px_rgba(234,179,8,0.4)]"
            onError={e => { e.target.src = placeholder(sponsor.name, 160, 64, '1a1200', 'eab308'); }}
          />
        </div>

        {/* footer */}
        <div className="px-4 pb-3 flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-black text-white/90 truncate">{sponsor.name}</p>
            {sponsor.website_url && (
              <p className="text-[9px] text-yellow-600/60 truncate mt-0.5">
                {sponsor.website_url.replace(/^https?:\/\/(www\.)?/, '')}
              </p>
            )}
          </div>
          <span className="ml-2 shrink-0 w-5 h-5 rounded-full bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-[9px] text-yellow-400 group-hover:bg-yellow-500/30 transition-colors">
            ↗
          </span>
        </div>

        {/* bottom strip */}
        <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-yellow-600/40 to-transparent" />
      </div>
    </a>
  );
}

/* ──────────────────────────────────────────────────────────── *
 *  SILVER — logo-only, no card borders                        *
 * ──────────────────────────────────────────────────────────── */
function SilverLogo({ sponsor }) {
  return (
    <a
      href={sponsor.website_url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      title={sponsor.name}
      className="
        flex items-center justify-center
        h-12 rounded-xl
        bg-gray-100/70 dark:bg-white/[0.04]
        hover:bg-gray-100 dark:hover:bg-white/[0.08]
        transition-all duration-200 group
        overflow-hidden px-3
      "
    >
      <img
        src={sponsor.logo_path || placeholder(sponsor.name, 100, 40, 'f3f4f6', '6b7280')}
        alt={sponsor.name}
        className="max-h-7 w-full object-contain opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-200 dark:invert dark:opacity-50 dark:group-hover:opacity-80"
        onError={e => { e.target.src = placeholder(sponsor.name, 100, 40, 'f3f4f6', '6b7280'); }}
      />
    </a>
  );
}

/* ──────────────────────────────────────────────────────────── *
 *  BRONZE — minimal name tag                                  *
 * ──────────────────────────────────────────────────────────── */
function BronzeTag({ sponsor }) {
  return (
    <a
      href={sponsor.website_url || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="
        inline-flex items-center gap-1.5
        rounded-md px-2 py-1
        bg-transparent
        border border-gray-200 dark:border-white/[0.07]
        hover:border-orange-300/60 dark:hover:border-orange-500/30
        hover:bg-orange-50/60 dark:hover:bg-orange-500/5
        transition-all duration-150 group
      "
    >
      {sponsor.logo_path ? (
        <img
          src={sponsor.logo_path}
          alt={sponsor.name}
          className="w-4 h-4 object-contain rounded-sm shrink-0"
          onError={e => { e.target.style.display = 'none'; }}
        />
      ) : (
        <span className="w-4 h-4 rounded-sm bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-[8px] font-black text-orange-500 shrink-0">
          {(sponsor.name || '?')[0].toUpperCase()}
        </span>
      )}
      <span className="text-[10px] font-medium text-gray-500 dark:text-white/40 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate">
        {sponsor.name}
      </span>
    </a>
  );
}

/* ──────────────────────────────────────────────────────────── *
 *  Section header                                             *
 * ──────────────────────────────────────────────────────────── */
function SectionHead({ labelKey, accent }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2">
      <span className={`text-[8px] font-black uppercase tracking-[0.22em] ${accent}`}>
        {t(labelKey)}
      </span>
      <div className="flex-1 h-px bg-current opacity-10" />
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── *
 *  Main                                                       *
 * ──────────────────────────────────────────────────────────── */
export default function SponsorsSidebar() {
  const { t } = useTranslation();

  const { data: sponsors = [], isLoading } = useQuery({
    queryKey: ['sponsors'],
    queryFn:  tournamentService.getSponsors,
  });

  if (isLoading) return (
    <div className="flex justify-center py-8"><Spinner size="sm" /></div>
  );

  const gold   = sponsors.filter(s => s.tier === 'gold');
  const silver = sponsors.filter(s => s.tier === 'silver');
  const bronze = sponsors.filter(s => s.tier === 'bronze');

  /* ── empty state ── */
  if (sponsors.length === 0) return (
    <div className="py-6 flex flex-col items-center gap-3 text-center">
      <div className="relative">
        <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl" />
        <span className="relative text-3xl">🏟️</span>
      </div>
      <div>
        <p className="text-[11px] font-bold text-gray-600 dark:text-gray-300">{t('home.sponsors_coming')}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{t('home.sponsors_contact')}</p>
      </div>
      <a
        href="mailto:mundiallamtar.contact@gmail.com"
        className="
          text-[10px] font-bold
          px-3 py-1.5 rounded-full
          bg-gradient-to-r from-yellow-500 to-amber-400
          text-black/80
          shadow-[0_2px_16px_rgba(234,179,8,0.35)]
          hover:shadow-[0_4px_24px_rgba(234,179,8,0.5)]
          hover:scale-[1.03]
          transition-all duration-200
        "
      >
        Devenir partenaire
      </a>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">

      {/* ── GOLD ── */}
      {gold.length > 0 && (
        <div className="flex flex-col gap-2">
          <SectionHead labelKey="home.partner_gold" accent="text-yellow-500 dark:text-yellow-400" />
          {gold.map(s => <GoldHero key={s.id} sponsor={s} />)}
        </div>
      )}

      {/* ── SILVER ── */}
      {silver.length > 0 && (
        <div className="flex flex-col gap-2">
          <SectionHead labelKey="home.partner_silver" accent="text-slate-400 dark:text-slate-500" />
          <div className="grid grid-cols-2 gap-1.5">
            {silver.map(s => <SilverLogo key={s.id} sponsor={s} />)}
          </div>
        </div>
      )}

      {/* ── BRONZE ── */}
      {bronze.length > 0 && (
        <div className="flex flex-col gap-2">
          <SectionHead labelKey="home.partner_bronze" accent="text-orange-400 dark:text-orange-500" />
          <div className="flex flex-wrap gap-1.5">
            {bronze.map(s => <BronzeTag key={s.id} sponsor={s} />)}
          </div>
        </div>
      )}

    </div>
  );
}
