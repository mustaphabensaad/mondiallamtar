import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { teamService, matchService } from '../../services/tournament.service';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import MatchCard from '../../components/match/MatchCard';
import PlayerModal from '../../components/ui/PlayerModal';

const POSITION_ORDER = { GK: 0, DEF: 1, MID: 2, FWD: 3 };

export default function MyTeam() {
  const { t } = useTranslation();
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);

  const { data: myTeam, isLoading } = useQuery({
    queryKey: ['my-team'],
    queryFn:  teamService.getMyTeam,
  });

  const teamId = myTeam?.team?.id;

  const { data: players = [], isLoading: pLoading } = useQuery({
    queryKey: ['team-players', teamId],
    queryFn:  () => teamService.getPlayers(teamId),
    enabled:  !!teamId,
  });

  const { data: allMatches = [], isLoading: mLoading } = useQuery({
    queryKey: ['matches-all'],
    queryFn:  matchService.getAll,
    enabled:  !!teamId,
  });

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  if (!myTeam?.team) return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="card">
        <EmptyState
          icon="🏟️"
          title="Pas encore d'équipe"
          subtitle="Créez votre équipe pour participer au Mundial Lamtar 2026 et inviter vos joueurs."
          color="green"
          size="lg"
          action={
            <Link to="/captain/team" className="btn-primary inline-flex items-center gap-2">
              <span>+</span> Créer mon équipe
            </Link>
          }
        />
      </div>
    </div>
  );

  const team    = myTeam.team;
  const sorted  = [...players].sort((a, b) =>
    (POSITION_ORDER[a.position] ?? 9) - (POSITION_ORDER[b.position] ?? 9) ||
    (a.jersey_number ?? 99) - (b.jersey_number ?? 99)
  );
  const matches = allMatches.filter(m => m.home_team_id == teamId || m.away_team_id == teamId);
  const goals   = sorted.reduce((s, p) => s + (p.goals || 0), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {selectedPlayerId && <PlayerModal playerId={selectedPlayerId} onClose={() => setSelectedPlayerId(null)} />}
      <Link to="/captain/dashboard" className="text-sm text-primary hover:underline mb-4 inline-block">← {t('nav.dashboard')}</Link>

      {/* Header */}
      <div className="card p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-6">
        <img
          src={team.logo_path || `https://placehold.co/96x96/16a34a/ffffff?text=${encodeURIComponent((team.name || '?')[0])}`}
          alt={team.name}
          className="w-24 h-24 rounded-2xl object-cover shrink-0"
        />
        <div className="flex-1 text-center sm:text-left">
          <h1 className="font-display text-3xl font-black">{team.name}</h1>
          <p className="text-gray-500 mt-1">Coach: <span className="font-medium text-gray-700 dark:text-gray-300">{team.coach_name}</span></p>
          <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
            <Badge variant={team.status}>{t(`team.status.${team.status}`)}</Badge>
            {team.group_letter && (
              <span className="text-xs font-bold bg-primary/10 text-primary px-3 py-1 rounded-full">
                Group {team.group_letter}
              </span>
            )}
          </div>
        </div>
        <div className="flex gap-6 text-center shrink-0">
          <div><p className="text-2xl font-black text-primary">{sorted.length}</p><p className="text-xs text-gray-400">Players</p></div>
          <div><p className="text-2xl font-black text-gold">{goals}</p><p className="text-xs text-gray-400">Goals</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* Players */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-border-light dark:border-border-dark flex items-center justify-between">
            <h2 className="font-display font-bold">{t('team.players')}</h2>
            <Link to="/captain/invites" className="text-xs text-primary hover:underline">+ Invite Players</Link>
          </div>
          {pLoading ? (
            <div className="flex justify-center py-10"><Spinner /></div>
          ) : sorted.length === 0 ? (
            <EmptyState
              icon="👥"
              title="Aucun joueur pour l'instant"
              subtitle="Invitez vos joueurs via des liens uniques pour compléter votre effectif."
              color="blue"
              size="md"
              action={
                <Link to="/captain/invites" className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-1.5">
                  <span>🔗</span> Générer des invitations
                </Link>
              }
            />
          ) : (
            <div className="divide-y divide-border-light dark:divide-border-dark">
              {sorted.map(p => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 cursor-pointer transition-colors" onClick={() => setSelectedPlayerId(p.id)}>
                  <span className="w-7 text-center text-xs font-bold text-gray-400 shrink-0">{p.jersey_number ?? '—'}</span>
                  <img
                    src={p.photo_path || `https://placehold.co/40x40/1e40af/ffffff?text=${encodeURIComponent((p.first_name || '?')[0])}`}
                    alt={`${p.first_name} ${p.last_name}`}
                    className="w-10 h-10 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{p.first_name} {p.last_name}</p>
                    <p className="text-xs text-gray-500">{t(`player.positions.${p.position}`)}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={p.validation_status} className="text-[10px]">{p.validation_status}</Badge>
                    {p.goals > 0 && <span className="text-primary font-bold text-xs">⚽ {p.goals}</span>}
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
          ) : matches.length === 0 ? (
            <EmptyState
              icon="⚽"
              title="Pas encore de matchs"
              subtitle="Vos matchs apparaîtront ici après le tirage au sort."
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
