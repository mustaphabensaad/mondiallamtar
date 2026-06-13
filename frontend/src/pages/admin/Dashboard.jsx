import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminService } from '../../services/tournament.service';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { imgUrl } from '../../utils/imageUrl';

const STAT_CONFIG = [
  { key: 'total_teams',    label: 'Équipes',       icon: '🏟️',  gradient: 'from-blue-500/10 to-indigo-500/10',   border: 'border-blue-200 dark:border-blue-800',   text: 'text-blue-600 dark:text-blue-400' },
  { key: 'approved_teams', label: 'Approuvées',    icon: '✅',   gradient: 'from-green-500/10 to-emerald-500/10', border: 'border-green-200 dark:border-green-800', text: 'text-green-600 dark:text-green-400' },
  { key: 'pending_teams',  label: 'En attente',    icon: '⏳',   gradient: 'from-amber-500/10 to-yellow-500/10',  border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-600 dark:text-amber-400' },
  { key: 'total_players',  label: 'Joueurs',       icon: '👥',   gradient: 'from-violet-500/10 to-purple-500/10', border: 'border-violet-200 dark:border-violet-800', text: 'text-violet-600 dark:text-violet-400' },
  { key: 'total_matches',  label: 'Matchs',        icon: '⚽',   gradient: 'from-gray-500/10 to-slate-500/10',   border: 'border-gray-200 dark:border-gray-700',  text: 'text-gray-700 dark:text-gray-300' },
  { key: 'live_matches',   label: 'En direct',     icon: '🔴',   gradient: 'from-red-500/10 to-rose-500/10',     border: 'border-red-200 dark:border-red-900',    text: 'text-red-600 dark:text-red-400' },
  { key: 'total_goals',    label: 'Buts',          icon: '🥅',   gradient: 'from-amber-500/10 to-yellow-500/10', border: 'border-amber-200 dark:border-amber-800', text: 'text-amber-600 dark:text-amber-400' },
  { key: 'payments_paid',  label: 'Paiements OK',  icon: '💳',   gradient: 'from-teal-500/10 to-cyan-500/10',    border: 'border-teal-200 dark:border-teal-800',  text: 'text-teal-600 dark:text-teal-400' },
];

const NAV_ITEMS = [
  { to: '/admin/teams',         icon: '🏟️', label: 'Équipes',       primary: true  },
  { to: '/admin/draw',          icon: '🎲', label: 'Tirage',        primary: true  },
  { to: '/admin/matches',       icon: '⚽', label: 'Matchs',        primary: false },
  { to: '/admin/draw/schedule', icon: '📅', label: 'Programmer',    primary: false },
  { to: '/admin/players',       icon: '👥', label: 'Joueurs',       primary: false },
  { to: '/admin/referees',      icon: '🟡', label: 'Arbitres',      primary: false },
  { to: '/admin/sponsors',      icon: '🤝', label: 'Sponsors',      primary: false },
  { to: '/admin/tournament',    icon: '⚙️', label: 'Tournoi',       primary: false },
  { to: '/admin/reports',       icon: '📊', label: 'Rapports',      primary: false },
];

export default function AdminDashboard() {
  const { t } = useTranslation();
  const qc = useQueryClient();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn:  adminService.getDashboard,
    refetchInterval: 30_000,
  });

  const { data: pending = [], isLoading: pendingLoading } = useQuery({
    queryKey: ['pending-teams'],
    queryFn:  adminService.getPending,
  });

  const approve = useMutation({
    mutationFn: adminService.approveTeam,
    onSuccess: () => { toast.success('Équipe approuvée'); qc.invalidateQueries(['pending-teams']); qc.invalidateQueries(['admin-dashboard']); },
    onError:   () => toast.error('Erreur'),
  });

  const reject = useMutation({
    mutationFn: adminService.rejectTeam,
    onSuccess: () => { toast.success('Équipe refusée'); qc.invalidateQueries(['pending-teams']); qc.invalidateQueries(['admin-dashboard']); },
    onError:   () => toast.error('Erreur'),
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-header mb-1">{t('admin.dashboard')}</h1>
          <p className="text-gray-500 text-sm">Mundial Lamtar 2026 · Panneau d'administration</p>
        </div>
        {stats?.live_matches > 0 && (
          <span className="live-badge">
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            {stats.live_matches} en direct
          </span>
        )}
      </div>

      {/* Stats grid */}
      {statsLoading ? (
        <div className="flex justify-center py-12"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {STAT_CONFIG.map(s => (
            <div key={s.key} className={`bg-gradient-to-br ${s.gradient} border ${s.border} rounded-2xl p-4 text-center`}>
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className={`text-3xl font-black ${s.text}`}>{stats?.[s.key] ?? '—'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Nav grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {NAV_ITEMS.map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`group flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all duration-150 hover:shadow-md hover:-translate-y-0.5
              ${item.primary
                ? 'bg-primary text-white border-primary shadow-sm hover:bg-primary-dark'
                : 'bg-white dark:bg-[#111827] border-gray-200 dark:border-gray-800 hover:border-primary/40'
              }`}
          >
            <span className="text-2xl">{item.icon}</span>
            <span className={`text-xs font-bold ${item.primary ? 'text-white' : 'text-gray-700 dark:text-gray-300 group-hover:text-primary'}`}>
              {item.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Pending teams */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/40">
          <h2 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-lg">⏳</span>
            {t('admin.pending')} — Équipes à valider
          </h2>
          {pending.length > 0 && (
            <span className="bg-amber-500 text-white text-xs font-black px-2.5 py-1 rounded-full">
              {pending.length}
            </span>
          )}
        </div>

        {pendingLoading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : pending.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-3xl mb-2">✅</p>
            <p className="text-gray-500 text-sm font-medium">Aucune équipe en attente</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800 bg-white dark:bg-[#111827]">
            {pending.map(team => (
              <div key={team.id} className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <img
                  src={imgUrl(team.logo_path) || `https://placehold.co/48x48/16a34a/ffffff?text=${encodeURIComponent((team.name||'?')[0])}`}
                  alt={team.name}
                  className="w-12 h-12 rounded-xl object-cover shadow-sm shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-gray-900 dark:text-white truncate">{team.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">{team.captain_email} · {team.player_count} joueurs</p>
                  <div className="mt-1.5">
                    <Badge variant={team.payment_status}>{t(`payment.status.${team.payment_status}`)}</Badge>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    loading={approve.isPending}
                    onClick={() => approve.mutate(team.id)}
                  >
                    ✓ {t('admin.approve')}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    loading={reject.isPending}
                    onClick={() => reject.mutate(team.id)}
                  >
                    ✗ {t('admin.reject')}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
