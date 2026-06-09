import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function MatchCard({ match, compact = false }) {
  const { t } = useTranslation();
  const isLive     = match.status === 'live';
  const isFinished = match.status === 'finished';
  const showScore  = isLive || isFinished;
  const isDraw     = isFinished && match.home_score === match.away_score;
  const homeWins   = isFinished && match.home_score > match.away_score;
  const awayWins   = isFinished && match.away_score > match.home_score;

  const dateObj = match.scheduled_at ? new Date(match.scheduled_at) : null;
  const timeStr = dateObj?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) ?? '';
  const dateStr = dateObj?.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) ?? '';

  const phaseLabel = {
    group: 'Phase de groupes', round_of_16: '1/8 finale',
    quarter_final: 'Quart', semi_final: 'Demi-finale', final: '🏆 Finale',
  }[match.phase] || '';

  return (
    <Link to={`/matches/${match.id}`} className="block group">
      <div className={`
        relative overflow-hidden rounded-2xl border transition-all duration-200
        ${isLive
          ? 'bg-gradient-to-br from-[#1c0808] via-[#150d0d] to-[#111827] border-red-600/50 shadow-xl glow-red'
          : 'bg-white dark:bg-[#111827] border-gray-200 dark:border-gray-800 hover:border-primary/40 hover:shadow-lg hover:-translate-y-0.5'
        }
      `}>
        {/* Live accent stripe */}
        {isLive && (
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-red-500 to-transparent" />
        )}

        <div className={compact ? 'p-3' : 'p-4'}>
          {/* ── Meta row ── */}
          <div className="flex items-center justify-between mb-3 text-xs gap-2">
            <span className={`font-mono tabular-nums shrink-0 ${isLive ? 'text-red-400' : 'text-gray-400'}`}>
              {dateStr && <span className="mr-1">{dateStr}</span>}
              {timeStr && <span className="font-bold">{timeStr}</span>}
            </span>

            {isLive ? (
              <span className="live-badge mx-auto shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                {t('match.live')}
              </span>
            ) : isFinished ? (
              <span className="inline-flex items-center gap-1 font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full shrink-0 mx-auto">
                ✓ {t('match.finished')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-full shrink-0 mx-auto">
                📅 {t('match.scheduled')}
              </span>
            )}

            <span className="text-[10px] font-medium text-gray-400 shrink-0 truncate max-w-[80px] text-right hidden sm:block">
              {match.venue || phaseLabel}
            </span>
          </div>

          {/* ── Teams + Score ── */}
          {showScore ? (
            /* Scored layout: logo · name · [score — score] · name · logo */
            <div className="flex items-center gap-2">
              {/* Home */}
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <img
                  src={match.home_team_logo || `https://placehold.co/44x44/16a34a/ffffff?text=${encodeURIComponent((match.home_team_name || '?')[0])}`}
                  alt={match.home_team_name}
                  className={`w-10 h-10 rounded-xl object-cover shadow-sm shrink-0 transition-all duration-200
                    ${homeWins ? 'ring-2 ring-primary ring-offset-1 ring-offset-white dark:ring-offset-[#111827] scale-105' : ''}`}
                />
                <span className={`text-sm font-bold truncate leading-tight
                  ${isLive ? 'text-gray-100' : homeWins ? 'text-gray-900 dark:text-white' : awayWins ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                  {match.home_team_name}
                </span>
              </div>

              {/* Score pill */}
              <div className={`flex items-center gap-1 shrink-0 px-3 py-2 rounded-xl border
                ${isLive
                  ? 'bg-red-950/60 border-red-800/50'
                  : 'bg-gray-100 dark:bg-gray-800/80 border-gray-200 dark:border-gray-700'
                }`}>
                <span className={`text-xl font-black tabular-nums w-5 text-center
                  ${isLive ? 'text-white' : homeWins ? 'text-primary' : isDraw ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500'}`}>
                  {match.home_score ?? 0}
                </span>
                <span className={`text-sm font-bold px-0.5 ${isLive ? 'text-red-500' : 'text-gray-400'}`}>–</span>
                <span className={`text-xl font-black tabular-nums w-5 text-center
                  ${isLive ? 'text-white' : awayWins ? 'text-primary' : isDraw ? 'text-gray-700 dark:text-gray-200' : 'text-gray-500'}`}>
                  {match.away_score ?? 0}
                </span>
              </div>

              {/* Away */}
              <div className="flex items-center gap-2 flex-1 min-w-0 flex-row-reverse">
                <img
                  src={match.away_team_logo || `https://placehold.co/44x44/1e40af/ffffff?text=${encodeURIComponent((match.away_team_name || '?')[0])}`}
                  alt={match.away_team_name}
                  className={`w-10 h-10 rounded-xl object-cover shadow-sm shrink-0 transition-all duration-200
                    ${awayWins ? 'ring-2 ring-primary ring-offset-1 ring-offset-white dark:ring-offset-[#111827] scale-105' : ''}`}
                />
                <span className={`text-sm font-bold truncate text-right leading-tight
                  ${isLive ? 'text-gray-100' : awayWins ? 'text-gray-900 dark:text-white' : homeWins ? 'text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-300'}`}>
                  {match.away_team_name}
                </span>
              </div>
            </div>
          ) : (
            /* Scheduled layout: logo · name · VS · name · logo */
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <img
                  src={match.home_team_logo || `https://placehold.co/44x44/16a34a/ffffff?text=${encodeURIComponent((match.home_team_name || '?')[0])}`}
                  alt={match.home_team_name}
                  className="w-10 h-10 rounded-xl object-cover shadow-sm shrink-0"
                />
                <span className="text-sm font-bold truncate text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors">
                  {match.home_team_name}
                </span>
              </div>

              <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 border border-gray-200 dark:border-gray-700">
                <span className="text-[10px] font-black text-gray-400">VS</span>
              </div>

              <div className="flex items-center gap-2 flex-1 min-w-0 flex-row-reverse">
                <img
                  src={match.away_team_logo || `https://placehold.co/44x44/1e40af/ffffff?text=${encodeURIComponent((match.away_team_name || '?')[0])}`}
                  alt={match.away_team_name}
                  className="w-10 h-10 rounded-xl object-cover shadow-sm shrink-0"
                />
                <span className="text-sm font-bold truncate text-right text-gray-800 dark:text-gray-200 group-hover:text-primary transition-colors">
                  {match.away_team_name}
                </span>
              </div>
            </div>
          )}

          {/* ── MOTM footer ── */}
          {!compact && isFinished && match.motm_name && (
            <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center gap-1.5 text-xs">
              <span className="text-gold text-sm">⭐</span>
              <span className="text-gray-400">{t('match.motm')}:</span>
              <span className="font-bold text-gold">{match.motm_name}</span>
            </div>
          )}

          {/* ── Referee ── */}
          {!compact && match.referee_name && !isLive && (
            <div className="mt-1.5 flex items-center justify-center gap-1 text-[10px] text-gray-400">
              <span>🟡</span><span>{match.referee_name}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
