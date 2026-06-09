import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { adminService } from '../services/tournament.service';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

const PHASES = [
  { key: 'round_of_16',   label: 'Huitièmes',    short: '1/8' },
  { key: 'quarter_final', label: 'Quarts',        short: 'QF'  },
  { key: 'semi_final',    label: 'Demies',        short: 'SF'  },
  { key: 'final',         label: 'Finale',        short: 'F'   },
];

function BracketMatch({ match }) {
  const isLive     = match.status === 'live';
  const isFinished = match.status === 'finished';
  const homeWins = isFinished && match.home_score > match.away_score;
  const awayWins = isFinished && match.away_score > match.home_score;

  return (
    <Link to={`/matches/${match.id}`} className="block group">
      <div className={`
        w-52 rounded-xl overflow-hidden border transition-all duration-200 group-hover:shadow-lg
        ${isLive
          ? 'border-red-600/60 bg-gradient-to-br from-red-950/60 to-gray-900 glow-red'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-[#111827] group-hover:border-primary/40'
        }
      `}>
        {isLive && <div className="h-0.5 bg-gradient-to-r from-red-500 to-red-400" />}

        {[
          { name: match.home_team_name, logo: match.home_team_logo, score: match.home_score, wins: homeWins },
          { name: match.away_team_name, logo: match.away_team_logo, score: match.away_score, wins: awayWins },
        ].map((team, ti) => (
          <div key={ti} className={`
            flex items-center gap-2.5 px-3 py-2
            ${ti === 0 ? '' : 'border-t border-gray-100 dark:border-gray-800'}
            ${isFinished && !team.wins ? 'opacity-50' : ''}
          `}>
            <img
              src={team.logo || `https://placehold.co/28x28/16a34a/ffffff?text=${ti === 0 ? 'H' : 'A'}`}
              alt={team.name || 'TBD'}
              className="w-7 h-7 rounded-lg object-cover shrink-0"
            />
            <span className={`flex-1 text-xs font-semibold truncate ${team.wins ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
              {team.name || <span className="text-gray-400 italic">TBD</span>}
            </span>
            {(isLive || isFinished) && (
              <span className={`text-sm font-black tabular-nums shrink-0 ${team.wins ? 'text-primary' : 'text-gray-500'}`}>
                {team.score ?? 0}
              </span>
            )}
          </div>
        ))}

        {isLive && (
          <div className="px-3 pb-2 pt-1 flex justify-center">
            <span className="live-badge text-[10px] px-2 py-0.5">LIVE</span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function TournamentBracket() {
  const { t } = useTranslation();
  const { data: bracket = {}, isLoading } = useQuery({
    queryKey: ['bracket'],
    queryFn:  adminService.getBracket,
    refetchInterval: 30_000,
  });

  const activePhasess = PHASES.filter(p => bracket[p.key]?.length > 0);

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  if (activePhasess.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="card overflow-hidden">
          {/* Decorative top bar */}
          <div className="h-1.5 bg-gradient-to-r from-primary via-green-400 to-secondary" />
          <EmptyState
            icon="🏆"
            title="Phase éliminatoire à venir"
            subtitle="Le tableau sera généré automatiquement à la fin de la phase de groupes. Les 2 premiers de chaque groupe se qualifient."
            color="amber"
            size="lg"
            action={
              <Link to="/standings" className="btn-primary text-sm py-2 px-5 inline-flex items-center gap-2">
                <span>📊</span> Voir le classement
              </Link>
            }
          />
          {/* Steps hint */}
          <div className="border-t border-gray-100 dark:border-gray-800 px-6 py-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">Progression du tournoi</p>
            <div className="flex items-center justify-center gap-1">
              {['Inscriptions', 'Groupes', '1/8', 'QF', 'SF', 'Finale'].map((s, i) => (
                <div key={s} className="flex items-center gap-1">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full
                    ${i <= 1 ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                    {s}
                  </span>
                  {i < 5 && <span className="text-gray-300 dark:text-gray-700 text-xs">›</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="page-header mb-2">{t('nav.bracket')}</h1>
        <p className="text-gray-500 text-sm">Mundial Lamtar 2026 · Phase à élimination directe</p>
      </div>

      {/* Phase labels (mobile) */}
      <div className="flex gap-2 justify-center mb-6 sm:hidden flex-wrap">
        {activePhasess.map(p => (
          <span key={p.key} className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">
            {p.short} · {p.label}
          </span>
        ))}
      </div>

      {/* Bracket */}
      <div className="overflow-x-auto pb-6">
        <div className="inline-flex gap-10 min-w-max px-4">
          {activePhasess.map(phase => (
            <div key={phase.key} className="flex flex-col">
              {/* Phase header */}
              <div className="text-center mb-5">
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{phase.label}</span>
                {phase.key === 'final' && <div className="text-2xl mt-1">🏆</div>}
              </div>

              {/* Matches column */}
              <div className={`
                flex flex-col justify-around gap-6
                ${phase.key === 'final' ? 'pt-4' : ''}
              `}
                style={{
                  minHeight: phase.key === 'round_of_16' ? '480px'
                           : phase.key === 'quarter_final' ? '400px'
                           : phase.key === 'semi_final' ? '280px'
                           : '160px',
                }}
              >
                {bracket[phase.key].map(m => (
                  <BracketMatch key={m.id} match={m} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-sm" /><span>Vainqueur</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-sm" /><span>En direct</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-sm" /><span>À jouer</span>
        </div>
      </div>
    </div>
  );
}
