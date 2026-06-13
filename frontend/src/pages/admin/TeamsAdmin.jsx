import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/tournament.service';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const TABS = ['all', 'pending'];
import { imgUrl } from '../../utils/imageUrl';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function proofUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  // Normalize absolute disk paths to relative
  const idx = path.replace(/\\/g, '/').indexOf('uploads/');
  const rel = idx !== -1 ? path.slice(idx) : path;
  return `${API_URL}/${rel}`;
}

// ── Team Detail Modal ──────────────────────────────────────────────────────────
function TeamDetailModal({ team, onClose, onApprove, onReject, onConfirmPayment, approving, rejecting, confirming }) {
  const [imgError, setImgError] = useState(false);
  const proof = proofUrl(team.payment_proof);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <p className="font-bold text-gray-900 dark:text-white">Détails de l'équipe</p>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >✕</button>
        </div>

        <div className="p-5 space-y-5">

          {/* Team identity */}
          <div className="flex items-center gap-4">
            <img
              src={imgUrl(team.logo_path) || `https://placehold.co/64x64/16a34a/ffffff?text=${encodeURIComponent((team.name || '?')[0])}`}
              alt={team.name}
              className="w-16 h-16 rounded-2xl object-cover shrink-0 border border-gray-100 dark:border-gray-800"
            />
            <div>
              <h2 className="font-display font-black text-xl text-gray-900 dark:text-white">{team.name}</h2>
              <p className="text-sm text-gray-500 mt-0.5">Coach : <span className="font-medium text-gray-700 dark:text-gray-300">{team.coach_name}</span></p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge variant={team.status}>{team.status}</Badge>
                <Badge variant={team.payment_status || 'unpaid'}>{team.payment_status || 'unpaid'}</Badge>
                {team.group_letter && (
                  <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    Groupe {team.group_letter}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Capitaine</p>
              <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{team.captain_email || '—'}</p>
              {team.captain_phone && <p className="text-xs text-gray-500 mt-0.5">{team.captain_phone}</p>}
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">Joueurs inscrits</p>
              <p className="font-bold text-2xl text-gray-900 dark:text-white">{team.player_count ?? 0}</p>
            </div>
            {team.created_at && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 col-span-2">
                <p className="text-xs text-gray-400 mb-1">Inscrit le</p>
                <p className="font-medium text-gray-700 dark:text-gray-300">
                  {new Date(team.created_at).toLocaleString('fr-DZ', { dateStyle: 'medium', timeStyle: 'short' })}
                </p>
              </div>
            )}
          </div>

          {/* Payment proof */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Preuve de paiement</p>
            {proof ? (
              <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40">
                {!imgError ? (
                  <img
                    src={proof}
                    alt="Preuve de paiement"
                    className="w-full max-h-72 object-contain"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  /* PDF or unrenderable file — show open link */
                  <div className="flex flex-col items-center gap-2 py-10 text-gray-400">
                    <span className="text-4xl">📄</span>
                    <p className="text-sm">Fichier non prévisualisable</p>
                  </div>
                )}
                <div className="px-4 py-2.5 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <p className="text-xs text-gray-400 truncate max-w-[60%]">
                    {team.payment_proof?.split('/').pop()}
                  </p>
                  <a
                    href={proof}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs px-3 py-1 bg-amber-500 text-white rounded-lg font-semibold hover:bg-amber-600 transition-colors"
                  >
                    Ouvrir ↗
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 px-4 py-5 text-gray-400">
                <span className="text-2xl">🧾</span>
                <div>
                  <p className="text-sm font-medium">Aucune preuve uploadée</p>
                  <p className="text-xs mt-0.5">Le capitaine n'a pas encore soumis de justificatif.</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            {team.status === 'pending' && (
              <>
                <button
                  onClick={() => { onApprove(team.id); onClose(); }}
                  disabled={approving}
                  className="flex-1 py-2 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  ✓ Approuver
                </button>
                <button
                  onClick={() => { onReject(team.id); onClose(); }}
                  disabled={rejecting}
                  className="flex-1 py-2 bg-red-600 text-white rounded-xl font-semibold text-sm hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  ✕ Rejeter
                </button>
              </>
            )}
            {team.payment_status === 'pending_review' && (
              <button
                onClick={() => { onConfirmPayment(team.id); onClose(); }}
                disabled={confirming}
                className="flex-1 py-2 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                💳 Confirmer le paiement
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function TeamsAdmin() {
  const { t } = useTranslation();
  const qc    = useQueryClient();
  const [tab, setTab]         = useState('all');
  const [selected, setSelected] = useState(null);

  const { data: allTeams = [], isLoading: allLoading } = useQuery({
    queryKey: ['admin-teams-all'],
    queryFn:  adminService.getAllTeams,
  });

  const { data: pending = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['admin-teams-pending'],
    queryFn:  adminService.getPending,
  });

  const approveMut = useMutation({
    mutationFn: adminService.approveTeam,
    onSuccess:  () => { qc.invalidateQueries(['admin-teams-all']); qc.invalidateQueries(['admin-teams-pending']); toast.success('Équipe approuvée'); },
    onError:    () => toast.error('Erreur'),
  });
  const rejectMut = useMutation({
    mutationFn: adminService.rejectTeam,
    onSuccess:  () => { qc.invalidateQueries(['admin-teams-all']); qc.invalidateQueries(['admin-teams-pending']); toast.success('Équipe rejetée'); },
    onError:    () => toast.error('Erreur'),
  });
  const payMut = useMutation({
    mutationFn: adminService.confirmPayment,
    onSuccess:  () => { qc.invalidateQueries(['admin-teams-all']); toast.success('Paiement confirmé'); },
    onError:    () => toast.error('Erreur'),
  });

  const teams   = tab === 'pending' ? pending   : allTeams;
  const loading = tab === 'pending' ? pendingLoading : allLoading;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {selected && (
        <TeamDetailModal
          team={selected}
          onClose={() => setSelected(null)}
          onApprove={approveMut.mutate}
          onReject={rejectMut.mutate}
          onConfirmPayment={payMut.mutate}
          approving={approveMut.isPending}
          rejecting={rejectMut.isPending}
          confirming={payMut.isPending}
        />
      )}

      <Link to="/admin" className="text-sm text-primary hover:underline mb-4 inline-block">← Dashboard</Link>
      <h1 className="font-display text-2xl font-bold mb-4">Teams Management</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {TABS.map(tb => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${tab === tb ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-gray-800/50 text-gray-500 hover:text-primary'}`}
          >
            {tb === 'pending' ? `Pending (${pending.length})` : 'All Teams'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : teams.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No teams found</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-border-light dark:divide-border-dark">
            {teams.map(team => (
              <div
                key={team.id}
                className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors cursor-pointer"
                onClick={() => setSelected(team)}
              >
                <img
                  src={imgUrl(team.logo_path) || `https://placehold.co/44x44/16a34a/ffffff?text=${encodeURIComponent((team.name || '?')[0])}`}
                  alt={team.name}
                  className="w-11 h-11 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{team.name}</p>
                  <p className="text-xs text-gray-500">
                    {team.coach_name}
                    {team.captain_email && <span className="ml-2 opacity-60">{team.captain_email}</span>}
                    {team.group_letter && <span className="ml-2 text-primary font-bold">Groupe {team.group_letter}</span>}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end" onClick={e => e.stopPropagation()}>
                  <Badge variant={team.status}>{team.status}</Badge>
                  <Badge variant={team.payment_status || 'unpaid'}>{team.payment_status || 'unpaid'}</Badge>

                  {team.payment_proof && (
                    <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg font-semibold">
                      🧾 Preuve
                    </span>
                  )}

                  {team.status === 'pending' && (
                    <>
                      <button
                        onClick={() => approveMut.mutate(team.id)}
                        disabled={approveMut.isPending}
                        className="text-xs px-2 py-1 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => rejectMut.mutate(team.id)}
                        disabled={rejectMut.isPending}
                        className="text-xs px-2 py-1 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {team.payment_status === 'pending_review' && (
                    <button
                      onClick={() => payMut.mutate(team.id)}
                      disabled={payMut.isPending}
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                    >
                      Confirm Payment
                    </button>
                  )}

                  <span className="text-gray-300 dark:text-gray-600 text-lg">›</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
