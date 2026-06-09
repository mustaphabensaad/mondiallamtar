import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { drawService } from '../services/tournament.service';
import Spinner from '../components/ui/Spinner';

const GROUP_COLORS = {
  A: { grad: 'from-blue-600 to-blue-700',   glow: 'shadow-blue-500/20'   },
  B: { grad: 'from-green-600 to-green-700',  glow: 'shadow-green-500/20'  },
  C: { grad: 'from-amber-500 to-amber-600',  glow: 'shadow-amber-500/20'  },
  D: { grad: 'from-red-600 to-red-700',      glow: 'shadow-red-500/20'    },
  E: { grad: 'from-purple-600 to-purple-700', glow: 'shadow-purple-500/20' },
  F: { grad: 'from-teal-600 to-teal-700',   glow: 'shadow-teal-500/20'   },
  G: { grad: 'from-orange-500 to-orange-600', glow: 'shadow-orange-500/20' },
  H: { grad: 'from-pink-600 to-pink-700',   glow: 'shadow-pink-500/20'   },
};

function TeamRow({ team, animate }) {
  const logo = team.logo_path ||
    `https://placehold.co/36x36/ffffff/16a34a?text=${encodeURIComponent((team.name || '?')[0])}`;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20
        transition-all duration-500 ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
    >
      <img src={logo} alt={team.name} className="w-9 h-9 rounded-lg object-cover shrink-0 ring-2 ring-white/30" />
      <span className="font-bold text-white text-sm truncate">{team.name}</span>
    </div>
  );
}

function EmptySlot() {
  return (
    <div className="flex items-center justify-center px-4 py-3 rounded-xl border border-white/20 border-dashed h-[56px]">
      <span className="text-white/30 text-2xl">?</span>
    </div>
  );
}

function GroupCard({ group, teamsPerGroup, newTeamId }) {
  const colors = GROUP_COLORS[group.letter] || GROUP_COLORS.A;
  const slots  = Array.from({ length: teamsPerGroup });

  return (
    <div className={`rounded-2xl overflow-hidden shadow-xl ${colors.glow} shadow-lg`}>
      {/* Header */}
      <div className={`bg-gradient-to-br ${colors.grad} px-5 py-4`}>
        <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-0.5">Groupe</p>
        <p className="text-white font-black text-3xl">{group.letter}</p>
        <p className="text-white/60 text-xs mt-1">{group.teams.length}/{teamsPerGroup} équipes</p>
      </div>

      {/* Team slots */}
      <div className={`bg-gradient-to-b ${colors.grad} p-3 space-y-2`}>
        {slots.map((_, i) => {
          const team = group.teams[i];
          if (team) {
            return (
              <TeamRow
                key={team.id}
                team={team}
                animate={team.id === newTeamId ? true : true}
              />
            );
          }
          return <EmptySlot key={`empty-${i}`} />;
        })}
      </div>
    </div>
  );
}

export default function GroupDraw() {
  const [localGroups, setLocalGroups]   = useState([]);
  const [lastAssigned, setLastAssigned] = useState(null);
  const [isFinalized, setIsFinalized]   = useState(false);
  const [connected, setConnected]       = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['draw-state-public'],
    queryFn:  drawService.getState,
  });

  useEffect(() => {
    if (!data) return;
    setLocalGroups(data.groups || []);
    setIsFinalized(data.finalized);
  }, [data]);

  // Real-time socket
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL, { transports: ['websocket', 'polling'] });

    socket.on('connect',    () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('draw:assign', ({ teamId, groupLetter, team }) => {
      setLastAssigned(teamId);
      setLocalGroups(prev =>
        prev.map(g => {
          // Remove team from any group (in case of reassignment)
          const cleaned = g.teams.filter(t => t.id !== teamId);
          if (g.letter === groupLetter) {
            return { ...g, teams: [...cleaned, team] };
          }
          return { ...g, teams: cleaned };
        })
      );
      // Clear highlight after animation
      setTimeout(() => setLastAssigned(null), 1500);
    });

    socket.on('draw:finalized', () => {
      setIsFinalized(true);
      refetch();
    });

    socket.on('draw:reset', () => {
      setIsFinalized(false);
      refetch();
    });

    socket.on('draw:init', () => refetch());

    return () => socket.disconnect();
  }, [refetch]);

  if (isLoading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <Spinner size="lg" />
    </div>
  );

  const { tournament, teamsPerGroup = 4, initialized } = data || {};
  const groups = localGroups;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <div className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-gray-400 hover:text-white text-sm transition-colors">← Retour</Link>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-gray-600'}`} />
          <span className="text-xs text-gray-400">{connected ? 'Connecté en direct' : 'Hors ligne'}</span>
        </div>
      </div>

      {/* Header */}
      <div className="text-center px-6 py-10">
        <p className="text-gray-400 text-sm uppercase tracking-widest font-semibold mb-2">
          {tournament?.name || 'Tournoi'}
        </p>
        <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">
          Tirage au Sort
        </h1>
        <p className="text-gray-400 text-sm">des groupes</p>

        {/* Status badge */}
        <div className="flex justify-center mt-4">
          {isFinalized ? (
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 text-sm font-semibold">
              ✅ Tirage terminé
            </span>
          ) : initialized ? (
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-sm font-semibold animate-pulse">
              🎲 Tirage en cours...
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-gray-400 text-sm">
              En attente du tirage
            </span>
          )}
        </div>
      </div>

      {/* Groups grid */}
      {initialized ? (
        <div className="px-4 pb-16 max-w-6xl mx-auto">
          <div className={`grid gap-5 ${
            groups.length <= 4
              ? 'grid-cols-2 sm:grid-cols-4'
              : 'grid-cols-2 sm:grid-cols-4'
          }`}>
            {groups.map(group => (
              <GroupCard
                key={group.id}
                group={group}
                teamsPerGroup={teamsPerGroup}
                newTeamId={lastAssigned}
              />
            ))}
          </div>

          {/* After finalize: links */}
          {isFinalized && (
            <div className="mt-12 text-center">
              <p className="text-gray-400 text-sm mb-4">Le tirage est finalisé. Les matchs de groupes ont été générés.</p>
              <div className="flex justify-center gap-3 flex-wrap">
                <Link
                  to="/matches"
                  className="px-5 py-2.5 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors text-sm"
                >
                  Voir les matchs →
                </Link>
                <Link
                  to="/standings"
                  className="px-5 py-2.5 border border-white/20 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors text-sm"
                >
                  Classement
                </Link>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-24">
          <p className="text-6xl mb-4">🎲</p>
          <p className="text-gray-500 text-lg">Le tirage n'a pas encore commencé</p>
          <p className="text-gray-600 text-sm mt-2">Cette page se mettra à jour automatiquement</p>
        </div>
      )}
    </div>
  );
}
