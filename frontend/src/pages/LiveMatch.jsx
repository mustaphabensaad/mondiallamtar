import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { matchService } from '../services/tournament.service';
import { useSocket } from '../hooks/useSocket';
import Spinner from '../components/ui/Spinner';
import { imgUrl } from '../utils/imageUrl';

function LiveTimer({ startedAt }) {
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    const start = new Date(startedAt).getTime();

    function tick() {
      const elapsed = Math.max(0, Date.now() - start);
      setMinutes(Math.floor(elapsed / 60000));
      setSeconds(Math.floor((elapsed % 60000) / 1000));
    }

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  return (
    <span className="inline-flex items-center gap-1.5 text-sm font-black text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-full tabular-nums">
      <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse shrink-0" />
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </span>
  );
}

function LiveMatchCard({ match }) {
  const { t } = useTranslation();
  const qc    = useQueryClient();

  useSocket(match.id, {
    match_update: () => qc.invalidateQueries(['matches-live']),
    goal:         () => qc.invalidateQueries(['matches-live']),
  });

  const homeLeads = match.home_score > match.away_score;
  const awayLeads = match.away_score > match.home_score;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-red-950/30 to-gray-900 border border-red-700/40 shadow-xl glow-red">
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(239,68,68,0.05),transparent_60%)] pointer-events-none" />

      <div className="relative p-6 sm:p-8">
        {/* Live badge + timer */}
        <div className="flex justify-center items-center gap-2 mb-6">
          <span className="live-badge text-sm px-4 py-1.5">
            <span className="w-2 h-2 rounded-full bg-white inline-block" />
            {t('match.live')}
          </span>
          <LiveTimer startedAt={match.started_at} />
        </div>

        {/* Teams + Score */}
        <div className="grid grid-cols-3 items-center gap-4">
          {/* Home */}
          <Link to={`/teams/${match.home_team_id}`} className="flex flex-col items-center gap-3 group">
            <div className={`relative rounded-2xl overflow-hidden shadow-lg transition-transform group-hover:scale-105 ${homeLeads ? 'ring-2 ring-primary glow-primary' : ''}`}>
              <img
                src={imgUrl(match.home_team_logo) || `https://placehold.co/80x80/16a34a/ffffff?text=H`}
                alt={match.home_team_name}
                className="w-20 h-20 object-cover"
              />
            </div>
            <p className={`font-display font-bold text-center text-sm sm:text-base leading-tight ${homeLeads ? 'text-white' : 'text-gray-300'}`}>
              {match.home_team_name}
            </p>
          </Link>

          {/* Score */}
          <div className="text-center">
            <p className="text-6xl sm:text-7xl font-black tabular-nums text-white tracking-tight">
              {match.home_score}<span className="text-red-500 mx-1">–</span>{match.away_score}
            </p>
            {match.venue && (
              <p className="text-xs text-gray-400 mt-3">📍 {match.venue}</p>
            )}
          </div>

          {/* Away */}
          <Link to={`/teams/${match.away_team_id}`} className="flex flex-col items-center gap-3 group">
            <div className={`relative rounded-2xl overflow-hidden shadow-lg transition-transform group-hover:scale-105 ${awayLeads ? 'ring-2 ring-primary glow-primary' : ''}`}>
              <img
                src={imgUrl(match.away_team_logo) || `https://placehold.co/80x80/1e40af/ffffff?text=A`}
                alt={match.away_team_name}
                className="w-20 h-20 object-cover"
              />
            </div>
            <p className={`font-display font-bold text-center text-sm sm:text-base leading-tight ${awayLeads ? 'text-white' : 'text-gray-300'}`}>
              {match.away_team_name}
            </p>
          </Link>
        </div>

        <div className="mt-6 flex justify-center">
          <Link to={`/matches/${match.id}`} className="btn-primary">
            Voir le match complet →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LiveMatch() {
  const { t } = useTranslation();
  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['matches-live'],
    queryFn:  matchService.getLive,
    refetchInterval: 15_000,
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <span className="live-badge text-sm px-3 py-1.5">
          <span className="w-2 h-2 rounded-full bg-white" />
          LIVE
        </span>
        <h1 className="page-header mb-0">{t('nav.live')}</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : matches.length === 0 ? (
        <div className="card p-14 text-center">
          <p className="text-5xl mb-4">⚽</p>
          <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-2">
            Aucun match en direct
          </h2>
          <p className="text-gray-500 text-sm mb-6">Les matchs en direct apparaîtront ici automatiquement.</p>
          <Link to="/matches" className="btn-primary">Voir tous les matchs</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {matches.map(m => <LiveMatchCard key={m.id} match={m} />)}
        </div>
      )}
    </div>
  );
}
