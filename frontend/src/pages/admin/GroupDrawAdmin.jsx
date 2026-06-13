import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { drawService } from '../../services/tournament.service';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';
import { imgUrl } from '../../utils/imageUrl';

const GROUP_COLORS = {
  A: { bg: 'bg-blue-500',   light: 'bg-blue-50 dark:bg-blue-900/20',   border: 'border-blue-200 dark:border-blue-800',   text: 'text-blue-700 dark:text-blue-300'   },
  B: { bg: 'bg-green-500',  light: 'bg-green-50 dark:bg-green-900/20', border: 'border-green-200 dark:border-green-800', text: 'text-green-700 dark:text-green-300' },
  C: { bg: 'bg-amber-500',  light: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-700 dark:text-amber-300' },
  D: { bg: 'bg-red-500',    light: 'bg-red-50 dark:bg-red-900/20',     border: 'border-red-200 dark:border-red-800',     text: 'text-red-700 dark:text-red-300'     },
  E: { bg: 'bg-purple-500', light: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', text: 'text-purple-700 dark:text-purple-300' },
  F: { bg: 'bg-teal-500',   light: 'bg-teal-50 dark:bg-teal-900/20',   border: 'border-teal-200 dark:border-teal-800',   text: 'text-teal-700 dark:text-teal-300'   },
  G: { bg: 'bg-orange-500', light: 'bg-orange-50 dark:bg-orange-900/20', border: 'border-orange-200 dark:border-orange-800', text: 'text-orange-700 dark:text-orange-300' },
  H: { bg: 'bg-pink-500',   light: 'bg-pink-50 dark:bg-pink-900/20',   border: 'border-pink-200 dark:border-pink-800',   text: 'text-pink-700 dark:text-pink-300'   },
};

function TeamCard({ team, selected, onClick, assigned }) {
  const logo = team.logo_path || `https://placehold.co/40x40/16a34a/fff?text=${encodeURIComponent((team.name || '?')[0])}`;
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all duration-150 text-left
        ${selected
          ? 'border-primary bg-primary/10 shadow-md ring-2 ring-primary/30'
          : assigned
            ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300'
            : 'border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:border-primary/50 hover:bg-primary/5'
        }`}
    >
      <img src={logo} alt={team.name} className="w-9 h-9 rounded-lg object-cover shrink-0" />
      <span className="font-semibold text-sm text-gray-900 dark:text-white truncate">{team.name}</span>
    </button>
  );
}

function GroupSlot({ group, teamsPerGroup, selectedTeam, onAssign, onUnassign }) {
  const colors = GROUP_COLORS[group.letter] || GROUP_COLORS.A;
  const slots = Array.from({ length: teamsPerGroup });

  return (
    <div className={`rounded-2xl border-2 overflow-hidden ${colors.border} ${colors.light}`}>
      {/* Header */}
      <div className={`${colors.bg} px-4 py-2.5 flex items-center justify-between`}>
        <span className="text-white font-black text-sm tracking-wider">GROUPE {group.letter}</span>
        <span className="text-white/80 text-xs font-medium">{group.teams.length}/{teamsPerGroup}</span>
      </div>

      {/* Team slots */}
      <div className="p-2 space-y-1.5">
        {slots.map((_, i) => {
          const team = group.teams[i];
          if (team) {
            return (
              <button
                key={team.id}
                onClick={() => onUnassign(team)}
                title="Cliquer pour retirer du groupe"
                className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150 group"
              >
                <img
                  src={imgUrl(team.logo_path) || `https://placehold.co/32x32/16a34a/fff?text=${encodeURIComponent((team.name||'?')[0])}`}
                  className="w-7 h-7 rounded-lg object-cover shrink-0"
                  alt={team.name}
                />
                <span className="text-sm font-semibold text-gray-900 dark:text-white truncate flex-1">{team.name}</span>
                <span className="text-red-400 opacity-0 group-hover:opacity-100 text-xs transition-opacity">✕</span>
              </button>
            );
          }
          // Empty slot
          return (
            <button
              key={`empty-${i}`}
              onClick={() => selectedTeam && onAssign(group.letter)}
              disabled={!selectedTeam}
              className={`w-full flex items-center justify-center px-3 py-2 rounded-xl border border-dashed transition-all duration-150 h-11
                ${selectedTeam
                  ? 'border-primary/60 bg-primary/5 hover:bg-primary/15 cursor-pointer'
                  : 'border-gray-300 dark:border-gray-600 bg-transparent cursor-default'
                }`}
            >
              {selectedTeam ? (
                <span className="text-primary text-xs font-bold">+ Placer ici</span>
              ) : (
                <span className="text-gray-300 dark:text-gray-600 text-lg">·</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function GroupDrawAdmin() {
  const qc = useQueryClient();
  const navigate = useNavigate();

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [confirmFinalize, setConfirmFinalize] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [finalizeResult, setFinalizeResult] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['draw-state'],
    queryFn: drawService.getState,
  });

  // Real-time socket updates
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL, { transports: ['websocket', 'polling'] });

    socket.on('draw:assign', () => { refetch(); setSelectedTeam(null); });
    socket.on('draw:init',   () => refetch());
    socket.on('draw:reset',  () => { refetch(); setFinalizeResult(null); });
    socket.on('draw:finalized', ({ matchCount }) => {
      refetch();
      setFinalizeResult(matchCount);
    });

    return () => socket.disconnect();
  }, [refetch]);

  const handleInit = async () => {
    setActionLoading(true);
    try {
      await drawService.init();
      toast.success('Tirage initialisé');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssign = async (groupLetter) => {
    if (!selectedTeam) return;
    try {
      await drawService.assign(selectedTeam.id, groupLetter);
      setSelectedTeam(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const handleUnassign = async (team) => {
    try {
      await drawService.unassign(team.id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    }
  };

  const handleFinalize = async () => {
    setActionLoading(true);
    setConfirmFinalize(false);
    try {
      const result = await drawService.finalize();
      setFinalizeResult(result.matchCount);
      toast.success(`Tirage finalisé — ${result.matchCount} matchs générés`);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la finalisation');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReset = async () => {
    setActionLoading(true);
    setConfirmReset(false);
    try {
      await drawService.reset();
      setFinalizeResult(null);
      setSelectedTeam(null);
      toast.success('Tirage réinitialisé');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  const { initialized, finalized, groups = [], unassigned = [], totalTeams, teamsPerGroup, numGroups } = data || {};
  const assignedCount = totalTeams - (unassigned?.length ?? 0);
  const allAssigned   = unassigned?.length === 0 && initialized;

  // ── FINALIZED state ─────────────────────────────────────────────────────────
  if (finalized && !confirmReset) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <PageHeader />

        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="text-4xl">✅</div>
          <div className="flex-1">
            <p className="font-black text-green-800 dark:text-green-300 text-lg">Tirage finalisé !</p>
            <p className="text-green-700 dark:text-green-400 text-sm mt-0.5">
              {finalizeResult ?? '?'} matchs de groupes générés — définissez maintenant l'heure et l'arbitre de chaque rencontre.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button onClick={() => navigate('/admin/draw/schedule')}>
              Programmer les matchs →
            </Button>
            <Button variant="ghost" onClick={() => setConfirmReset(true)}>
              Réinitialiser
            </Button>
          </div>
        </div>

        {/* Show final groups */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {groups.map(group => {
            const colors = GROUP_COLORS[group.letter] || GROUP_COLORS.A;
            return (
              <div key={group.id} className={`rounded-2xl border-2 overflow-hidden ${colors.border} ${colors.light}`}>
                <div className={`${colors.bg} px-4 py-2.5`}>
                  <span className="text-white font-black text-sm tracking-wider">GROUPE {group.letter}</span>
                </div>
                <div className="p-2 space-y-1.5">
                  {group.teams.map(team => (
                    <div key={team.id} className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 rounded-xl">
                      <img src={imgUrl(team.logo_path) || `https://placehold.co/28x28/16a34a/fff?text=${encodeURIComponent((team.name||'?')[0])}`}
                        className="w-7 h-7 rounded-lg object-cover shrink-0" alt={team.name} />
                      <span className="text-xs font-semibold text-gray-800 dark:text-white truncate">{team.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── RESET CONFIRM ────────────────────────────────────────────────────────────
  if (confirmReset) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">⚠️</p>
        <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Réinitialiser le tirage ?</h2>
        <p className="text-gray-500 text-sm mb-6">
          Tous les groupes, assignations et matchs de groupes seront supprimés. Cette action est irréversible.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="danger" loading={actionLoading} onClick={handleReset}>Oui, réinitialiser</Button>
          <Button variant="ghost" onClick={() => setConfirmReset(false)}>Annuler</Button>
        </div>
      </div>
    );
  }

  // ── NOT INITIALIZED ──────────────────────────────────────────────────────────
  if (!initialized) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <PageHeader />
        <div className="max-w-md mx-auto mt-16 text-center">
          <div className="text-6xl mb-4">🎲</div>
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">Tirage au Sort des Groupes</h2>
          <p className="text-gray-500 text-sm mb-2">
            <strong className="text-gray-700 dark:text-gray-300">{totalTeams}</strong> équipe(s) approuvée(s) prête(s) au tirage.
          </p>
          <p className="text-gray-400 text-xs mb-8">
            Ceci va créer {numGroups} groupes ({numGroups === 8 ? 'A–H' : 'A–D'}) de {teamsPerGroup} équipes chacun.
          </p>
          <Button size="lg" loading={actionLoading} onClick={handleInit}>
            Démarrer le tirage
          </Button>
        </div>
      </div>
    );
  }

  // ── DRAW IN PROGRESS ─────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <PageHeader />
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setConfirmReset(true)}
          >
            Réinitialiser
          </Button>
          <Button
            size="sm"
            disabled={!allAssigned}
            loading={actionLoading}
            onClick={() => setConfirmFinalize(true)}
            title={!allAssigned ? `${unassigned.length} équipe(s) non assignée(s)` : ''}
          >
            Finaliser le tirage
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-gray-600 dark:text-gray-400 font-medium">
            Équipes assignées : <strong className="text-gray-900 dark:text-white">{assignedCount}</strong> / {totalTeams}
          </span>
          {selectedTeam && (
            <span className="text-primary font-semibold text-xs animate-pulse">
              ← Sélectionnez un groupe pour &laquo;{selectedTeam.name}&raquo;
            </span>
          )}
        </div>
        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: totalTeams ? `${(assignedCount / totalTeams) * 100}%` : '0%' }}
          />
        </div>
      </div>

      <div className="flex gap-5">
        {/* ── Pool: unassigned teams ── */}
        <div className="w-56 shrink-0">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">
            Pool ({unassigned.length})
          </p>
          {unassigned.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-2xl mb-1">✅</p>
              <p className="text-xs">Toutes assignées</p>
            </div>
          ) : (
            <div className="space-y-2">
              {unassigned.map(team => (
                <TeamCard
                  key={team.id}
                  team={team}
                  selected={selectedTeam?.id === team.id}
                  assigned={false}
                  onClick={() => setSelectedTeam(prev => prev?.id === team.id ? null : team)}
                />
              ))}
            </div>
          )}

          {/* Instructions */}
          <div className="mt-6 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-xs text-gray-500 space-y-1.5">
            <p><strong>1.</strong> Cliquez une équipe</p>
            <p><strong>2.</strong> Cliquez un emplacement libre dans un groupe</p>
            <p><strong>3.</strong> Cliquez une équipe assignée pour la retirer</p>
          </div>
        </div>

        {/* ── Groups grid ── */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {groups.map(group => (
            <GroupSlot
              key={group.id}
              group={group}
              teamsPerGroup={teamsPerGroup}
              selectedTeam={selectedTeam}
              onAssign={handleAssign}
              onUnassign={handleUnassign}
            />
          ))}
        </div>
      </div>

      {/* Finalize confirmation dialog */}
      {confirmFinalize && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <p className="text-2xl mb-3 text-center">🎲</p>
            <h3 className="text-lg font-black text-gray-900 dark:text-white text-center mb-2">
              Finaliser le tirage ?
            </h3>
            <p className="text-gray-500 text-sm text-center mb-6">
              Ceci va générer automatiquement tous les matchs de poules (round-robin). Vous pourrez ensuite définir l'heure et l'arbitre pour chaque match.
            </p>
            <div className="flex gap-3">
              <Button className="flex-1" loading={actionLoading} onClick={handleFinalize}>
                Confirmer
              </Button>
              <Button className="flex-1" variant="ghost" onClick={() => setConfirmFinalize(false)}>
                Annuler
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PageHeader() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Link to="/admin" className="text-gray-400 hover:text-primary text-sm">← Admin</Link>
      </div>
      <h1 className="text-2xl font-black text-gray-900 dark:text-white">Tirage au Sort des Groupes</h1>
      <p className="text-gray-500 text-sm mt-0.5">Assignez chaque équipe à un groupe</p>
    </div>
  );
}
