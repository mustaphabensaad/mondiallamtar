import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Badge from '../ui/Badge';

function TeamBlock({ name, logo, score, showScore }) {
  return (
    <div className="flex flex-col items-center gap-1 min-w-0 flex-1">
      <img
        src={logo || `https://placehold.co/48x48/16a34a/ffffff?text=${encodeURIComponent((name||'?')[0])}`}
        alt={name}
        className="w-12 h-12 rounded-xl object-cover"
      />
      <span className="text-xs font-semibold text-center line-clamp-2 leading-tight">{name}</span>
      {showScore && (
        <span className="text-xl font-black text-primary">{score ?? 0}</span>
      )}
    </div>
  );
}

export default function MatchCard({ match, compact = false }) {
  const { t } = useTranslation();
  const isLive     = match.status === 'live';
  const isFinished = match.status === 'finished';
  const showScore  = isLive || isFinished;

  return (
    <Link to={`/matches/${match.id}`} className="block">
      <div className={`card p-4 hover:shadow-md transition-shadow ${isLive ? 'ring-2 ring-red-500/50' : ''}`}>
        {/* Status + time */}
        <div className="flex justify-between items-center mb-3 text-xs text-gray-500">
          <span>
            {match.scheduled_at
              ? new Date(match.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : ''}
          </span>
          {isLive ? (
            <span className="live-badge">
              <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
              {t('match.live')}
            </span>
          ) : isFinished ? (
            <Badge variant="approved">{t('match.finished')}</Badge>
          ) : (
            <Badge variant="pending">{t('match.scheduled')}</Badge>
          )}
          <span className="text-gray-400">{match.venue || ''}</span>
        </div>

        {/* Teams + score */}
        <div className="flex items-center gap-2">
          <TeamBlock name={match.home_team_name} logo={match.home_team_logo} score={match.home_score} showScore={showScore} />

          <div className="flex flex-col items-center px-2 shrink-0">
            {showScore ? (
              <span className="text-2xl font-black tabular-nums">
                {match.home_score} – {match.away_score}
              </span>
            ) : (
              <span className="text-sm font-bold text-gray-400">{t('match.vs')}</span>
            )}
          </div>

          <TeamBlock name={match.away_team_name} logo={match.away_team_logo} score={match.away_score} showScore={showScore} />
        </div>

        {/* MOTM */}
        {!compact && isFinished && match.motm_name && (
          <div className="mt-3 pt-3 border-t border-border-light dark:border-border-dark text-xs text-center text-gray-500">
            ⭐ {t('match.motm')}: <span className="font-semibold text-gold">{match.motm_name}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
