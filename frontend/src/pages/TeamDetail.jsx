import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { teamService, matchService } from '../services/tournament.service';
import Badge from '../components/ui/Badge';
import MatchCard from '../components/match/MatchCard';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import PlayerModal from '../components/ui/PlayerModal';

const POSITION_ORDER = { GK: 0, DEF: 1, MID: 2, FWD: 3 };

export default function TeamDetail() {
  const { id }    = useParams();
  const { t }     = useTranslation();
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);

  const { data: team,    isLoading: tLoading } = useQuery({ queryKey: ['team', id],         queryFn: () => teamService.getById(id) });
  const { data: players, isLoading: pLoading } = useQuery({ queryKey: ['team-players', id], queryFn: () => teamService.getPlayers(id) });
  const { data: matches, isLoading: mLoading } = useQuery({
    queryKey: ['team-matches', id],
    queryFn:  () => matchService.getAll().then(ms => ms.filter(m => m.home_team_id == id || m.away_team_id == id)),
  });

  if (tLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!team) return <div className="text-center py-24 text-gray-400">Team not found</div>;

  const sorted = [...(players || [])].sort((a, b) =>
    (POSITION_ORDER[a.position] ?? 9) - (POSITION_ORDER[b.position] ?? 9) ||
    (a.jersey_number ?? 99) - (b.jersey_number ?? 99)
  );

  const goals = sorted.reduce((s, p) => s + (p.goals || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {selectedPlayerId && <PlayerModal playerId={selectedPlayerId} onClose={() => setSelectedPlayerId(null)} />}
      <Link to="/teams" className="text-sm text-primary hover:underline mb-4 inline-block">← {t('nav.teams')}</Link>

      {/* Header */}
      <div className="card p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-6">
        <img
          src={team.logo_path || `https://placehold.co/96x96/16a34a/ffffff?text=${encodeURIComponent((team.name||'?')[0])}`}
          alt={team.name}
          className="w-24 h-24 rounded-2xl object-cover shrink-0"
        />
        <div className="flex-1 text-center sm:text-left">
          <h1 className="font-display text-3xl font-black">{team.name}</h1>
          <p className="text-gray-500 mt-1">{t('team.coach')}: <span className="font-medium text-gray-700 dark:text-gray-300">{team.coach_name}</span></p>
          <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
            <Badge variant={team.status}>{t(`team.status.${team.status}`)}</Badge>
            {team.group_letter && (
              <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                {t('team.group')} {team.group_letter}
              </span>
            )}
          </div>
        </div>
        {/* Quick stats */}
        <div className="flex gap-6 text-center shrink-0">
          <div><p className="text-2xl font-black text-primary">{sorted.length}</p><p className="text-xs text-gray-400">{t('team.players')}</p></div>
          <div><p className="text-2xl font-black text-gold">{goals}</p><p className="text-xs text-gray-400">Goals</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Players */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-border-light dark:border-border-dark">
            <h2 className="font-display font-bold">{t('team.players')}</h2>
          </div>
          {pLoading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : sorted.length === 0 ? (
            <EmptyState
              icon="👥"
              title="Effectif non complété"
              subtitle="Les joueurs rejoindront cette équipe via invitation du capitaine."
              color="blue"
              size="md"
            />
          ) : (
            <div className="divide-y divide-border-light dark:divide-border-dark">
              {sorted.map(p => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer transition-colors" onClick={() => setSelectedPlayerId(p.id)}>
                  <span className="w-7 text-center text-xs font-bold text-gray-400 shrink-0">
                    {p.jersey_number ?? '—'}
                  </span>
                  <img
                    src={p.photo_path || `https://placehold.co/40x40/1e40af/ffffff?text=${encodeURIComponent((p.first_name||'?')[0])}`}
                    alt={`${p.first_name} ${p.last_name}`}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{p.first_name} {p.last_name}</p>
                    <p className="text-xs text-gray-500">{t(`player.positions.${p.position}`)}</p>
                  </div>
                  <div className="flex items-center gap-3 text-xs shrink-0">
                    {p.goals > 0 && <span className="text-primary font-bold">⚽ {p.goals}</span>}
                    {p.yellow_cards > 0 && <span className="bg-yellow-400 text-black font-bold px-1.5 py-0.5 rounded text-[10px]">{p.yellow_cards}</span>}
                    {p.red_cards > 0 && <span className="bg-red-600 text-white font-bold px-1.5 py-0.5 rounded text-[10px]">{p.red_cards}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Matches */}
        <div>
          <h2 className="font-display font-bold mb-3">Matches</h2>
          {mLoading ? (
            <div className="flex justify-center py-6"><Spinner /></div>
          ) : !matches?.length ? (
            <EmptyState
              icon="⚽"
              title="Aucun match programmé"
              subtitle="Les matchs de cette équipe apparaîtront ici après le tirage au sort."
              color="gray"
              size="sm"
            />
          ) : (
            <div className="flex flex-col gap-3">
              {matches.map(m => <MatchCard key={m.id} match={m} compact />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
