import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function TeamRow({ name, logo, score, showScore, winner }) {
  return (
    <div className={`flex items-center gap-3 py-2 ${winner ? 'opacity-100' : showScore ? 'opacity-60' : 'opacity-100'}`}>
      <img
        src={logo || `https://placehold.co/40x40/16a34a/ffffff?text=${encodeURIComponent((name||'?')[0])}`}
        alt={name}
        className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-sm"
      />
      <span className={`flex-1 text-sm font-semibold truncate ${winner ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
        {name}
      </span>
      {showScore && (
        <span className={`text-xl font-black tabular-nums shrink-0 ${winner ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>
          {score ?? 0}
        </span>
      )}
    </div>
  );
}

export default function MatchCard({ match, compact = false }) {
  const { t } = useTranslation();
  const isLive     = match.status === 'live';
  const isFinished = match.status === 'finished';
  const showScore  = isLive || isFinished;

  const homeWins = isFinished && match.home_score > match.away_score;
  const awayWins = isFinished && match.away_score > match.home_score;

  const timeStr = match.scheduled_at
    ? new Date(match.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <Link to={`/matches/${match.id}`} className="block group">
      <div className={`
        relative overflow-hidden rounded-2xl border transition-all duration-200
        ${isLive
          ? 'bg-gradient-to-br from-red-950/60 via-gray-900 to-gray-900 border-red-700/60 shadow-lg glow-red'
          : 'bg-white dark:bg-[#111827] border-gray-200 dark:border-gray-800 hover:border-primary/40 hover:shadow-md hover:-translate-y-0.5'
        }
      `}>

        {/* Live top stripe */}
        {isLive && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />
        )}

        <div className="p-4">
          {/* Header row: time / status / venue */}
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="text-gray-400 font-mono flex items-center gap-1">
              {timeStr && <>🕐 {timeStr}</>}
            </span>

            {isLive ? (
              <span className="live-badge">
                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                {t('match.live')}
              </span>
            ) : isFinished ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
                ✓ {t('match.finished')}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-full">
                📅 {t('match.scheduled')}
              </span>
            )}

            {match.venue && (
              <span className="text-gray-400 truncate max-w-[80px] hidden sm:block">📍 {match.venue}</span>
            )}
          </div>

          {/* Teams */}
          <div className={`divide-y ${isLive ? 'divide-gray-700/50' : 'divide-gray-100 dark:divide-gray-800'}`}>
            <TeamRow
              name={match.home_team_name}
              logo={match.home_team_logo}
              score={match.home_score}
              showScore={showScore}
              winner={homeWins}
            />
            <TeamRow
              name={match.away_team_name}
              logo={match.away_team_logo}
              score={match.away_score}
              showScore={showScore}
              winner={awayWins}
            />
          </div>

          {/* MOTM */}
          {!compact && isFinished && match.motm_name && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-center gap-2 text-xs">
              <span className="text-gold">⭐</span>
              <span className="text-gray-500">{t('match.motm')}:</span>
              <span className="font-bold text-gold">{match.motm_name}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
