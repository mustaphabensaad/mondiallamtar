import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { matchService } from '../services/tournament.service';
import { useSocket } from '../hooks/useSocket';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

const EVENT_META = {
  goal:             { icon: '⚽', label: 'But',            color: 'text-green-500'  },
  own_goal:         { icon: '⚽', label: 'Csc',            color: 'text-red-400'    },
  penalty_scored:   { icon: '⚽', label: 'Penalty',        color: 'text-green-500'  },
  penalty_missed:   { icon: '✗',  label: 'Penalty raté',   color: 'text-red-400'    },
  yellow_card:      { icon: '🟨', label: 'Avertissement',  color: 'text-yellow-500' },
  red_card:         { icon: '🟥', label: 'Expulsion',      color: 'text-red-500'    },
  substitution_in:  { icon: '↑',  label: 'Entrée',         color: 'text-blue-400'   },
  substitution_out: { icon: '↓',  label: 'Sortie',         color: 'text-orange-400' },
};

export default function MatchDetail() {
  const { id }  = useParams();
  const { t }   = useTranslation();
  const qc      = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['match', id],
    queryFn:  () => matchService.getById(id),
    refetchInterval: (data) => data?.match?.status === 'live' ? 15000 : false,
  });

  useSocket(id, {
    match_update: () => qc.invalidateQueries(['match', id]),
    goal:         () => qc.invalidateQueries(['match', id]),
    card:         () => qc.invalidateQueries(['match', id]),
  });

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!data?.match) return (
    <div className="text-center py-24">
      <p className="text-4xl mb-3">🔍</p>
      <p className="text-gray-500">Match introuvable</p>
    </div>
  );

  const { match, events = [] } = data;
  const isLive     = match.status === 'live';
  const isFinished = match.status === 'finished';
  const homeWins   = isFinished && match.home_score > match.away_score;
  const awayWins   = isFinished && match.away_score > match.home_score;

  const homeEvents = events.filter(e => e.team_id === match.home_team_id);
  const awayEvents = events.filter(e => e.team_id === match.away_team_id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <Link to="/matches" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors mb-6 group">
        <svg className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {t('nav.matches')}
      </Link>

      {/* Score hero */}
      <div className={`relative overflow-hidden rounded-3xl mb-6 shadow-xl
        ${isLive
          ? 'bg-gradient-to-br from-gray-900 via-red-950/30 to-gray-900 border border-red-700/40 glow-red'
          : 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-gray-700'
        }`}
      >
        {isLive && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />}

        <div className="relative p-6 sm:p-8">
          {/* Status */}
          <div className="flex justify-center mb-5">
            {isLive ? (
              <span className="live-badge text-sm px-4 py-1.5">
                <span className="w-2 h-2 rounded-full bg-white" /> {t('match.live')}
              </span>
            ) : isFinished ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 bg-white/10 px-3 py-1.5 rounded-full">
                ✓ {t('match.finished')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full border border-blue-500/20">
                📅 {t('match.scheduled')}
              </span>
            )}
          </div>

          {/* Teams + score */}
          <div className="grid grid-cols-3 items-center gap-4">
            <Link to={`/teams/${match.home_team_id}`} className="flex flex-col items-center gap-2.5 group">
              <div className={`rounded-2xl overflow-hidden shadow-md transition-transform group-hover:scale-105 ${homeWins ? 'ring-2 ring-primary' : ''}`}>
                <img src={match.home_team_logo || `https://placehold.co/72x72/16a34a/ffffff?text=H`} alt={match.home_team_name}
                  className={`w-16 h-16 sm:w-20 sm:h-20 object-cover ${isFinished && !homeWins ? 'opacity-50' : ''}`} />
              </div>
              <p className={`font-display font-bold text-center text-sm sm:text-base leading-tight ${isFinished && !homeWins ? 'text-gray-400' : 'text-white'}`}>
                {match.home_team_name}
              </p>
            </Link>

            <div className="text-center">
              {(isLive || isFinished) ? (
                <p className="text-5xl sm:text-6xl font-black tabular-nums text-white tracking-tight">
                  {match.home_score}<span className="text-gray-500 mx-1">–</span>{match.away_score}
                </p>
              ) : (
                <p className="text-2xl font-bold text-gray-500">{t('match.vs')}</p>
              )}
              <div className="mt-3 space-y-1">
                {match.scheduled_at && (
                  <p className="text-xs text-gray-400">
                    🕐 {new Date(match.scheduled_at).toLocaleString([], { weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                  </p>
                )}
                {match.venue    && <p className="text-xs text-gray-400">📍 {match.venue}</p>}
                {match.referee_name && <p className="text-xs text-gray-400">🏁 {match.referee_name}</p>}
              </div>
            </div>

            <Link to={`/teams/${match.away_team_id}`} className="flex flex-col items-center gap-2.5 group">
              <div className={`rounded-2xl overflow-hidden shadow-md transition-transform group-hover:scale-105 ${awayWins ? 'ring-2 ring-primary' : ''}`}>
                <img src={match.away_team_logo || `https://placehold.co/72x72/1e40af/ffffff?text=A`} alt={match.away_team_name}
                  className={`w-16 h-16 sm:w-20 sm:h-20 object-cover ${isFinished && !awayWins ? 'opacity-50' : ''}`} />
              </div>
              <p className={`font-display font-bold text-center text-sm sm:text-base leading-tight ${isFinished && !awayWins ? 'text-gray-400' : 'text-white'}`}>
                {match.away_team_name}
              </p>
            </Link>
          </div>

          {/* MOTM */}
          {isFinished && match.motm_name && (
            <div className="mt-6 pt-5 border-t border-white/10 flex items-center justify-center gap-3">
              <img src={match.motm_photo || `https://placehold.co/40x40/d97706/ffffff?text=M`} alt={match.motm_name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-gold" />
              <div className="text-center">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-0.5">{t('match.motm')}</p>
                <p className="font-bold text-gold">{match.motm_name}</p>
              </div>
              <span className="text-2xl">⭐</span>
            </div>
          )}
        </div>
      </div>

      {/* Events timeline */}
      {events.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#111827] shadow-sm">
          <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2 bg-gray-50 dark:bg-gray-800/40">
            <span className="text-base">📋</span>
            <h2 className="font-display font-bold text-sm text-gray-900 dark:text-white">Événements du match</h2>
            <span className="ml-auto text-xs text-gray-400">{events.length} événements</span>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {events.map(ev => {
              const isHome = ev.team_id === match.home_team_id;
              const meta   = EVENT_META[ev.event_type] || { icon: '•', label: ev.event_type, color: 'text-gray-400' };
              return (
                <div key={ev.id} className={`flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${!isHome ? 'flex-row-reverse' : ''}`}>
                  <span className={`text-lg w-7 text-center shrink-0 ${meta.color}`}>{meta.icon}</span>
                  <span className="text-xs font-black text-gray-400 w-8 text-center shrink-0 tabular-nums">{ev.minute}'</span>
                  <div className={`flex-1 ${!isHome ? 'text-right' : ''}`}>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{ev.player_name}</p>
                    <p className={`text-xs ${meta.color} font-medium`}>{meta.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
