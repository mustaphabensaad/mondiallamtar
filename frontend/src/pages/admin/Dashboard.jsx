import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminService } from '../../services/tournament.service';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

function StatBox({ value, label, color = 'text-primary' }) {
  return (
    <div className="card p-5 text-center">
      <p className={`text-4xl font-black ${color}`}>{value ?? '—'}</p>
      <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">{label}</p>
    </div>
  );
}

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
    onSuccess: () => { toast.success('Team approved'); qc.invalidateQueries(['pending-teams']); qc.invalidateQueries(['admin-dashboard']); },
    onError:   () => toast.error('Failed'),
  });

  const reject = useMutation({
    mutationFn: adminService.rejectTeam,
    onSuccess: () => { toast.success('Team rejected'); qc.invalidateQueries(['pending-teams']); qc.invalidateQueries(['admin-dashboard']); },
    onError:   () => toast.error('Failed'),
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-6">{t('admin.dashboard')}</h1>

      {/* Stats grid */}
      {statsLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatBox value={stats?.total_teams}    label="Total Teams" />
          <StatBox value={stats?.approved_teams} label="Approved"    color="text-green-600" />
          <StatBox value={stats?.pending_teams}  label="Pending"     color="text-yellow-600" />
          <StatBox value={stats?.total_players}  label="Players" />
          <StatBox value={stats?.total_matches}  label="Matches" />
          <StatBox value={stats?.live_matches}   label="Live Now"    color="text-red-500" />
          <StatBox value={stats?.total_goals}    label="Goals"       color="text-gold" />
        </div>
      )}

      {/* Quick links */}
      <div className="flex gap-3 flex-wrap mb-8">
        <Link to="/admin/teams"   className="btn-primary">{t('admin.teams')}</Link>
        <Link to="/admin/matches" className="btn-secondary">{t('admin.matches')}</Link>
        <Link to="/admin/players" className="btn-secondary">{t('admin.players')}</Link>
      </div>

      {/* Pending team approvals */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-border-light dark:border-border-dark flex items-center justify-between">
          <h2 className="font-bold">{t('admin.pending')} Teams</h2>
          {pending.length > 0 && (
            <span className="bg-yellow-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {pending.length}
            </span>
          )}
        </div>

        {pendingLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : pending.length === 0 ? (
          <p className="text-center text-gray-400 py-8 text-sm">No pending teams</p>
        ) : (
          <div className="divide-y divide-border-light dark:divide-border-dark">
            {pending.map(team => (
              <div key={team.id} className="flex items-center gap-4 px-5 py-4">
                <img
                  src={team.logo_path || `https://placehold.co/48x48/16a34a/ffffff?text=${encodeURIComponent((team.name||'?')[0])}`}
                  alt={team.name}
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{team.name}</p>
                  <p className="text-xs text-gray-500">{team.captain_email} · {team.player_count} players</p>
                  <Badge variant={team.payment_status} className="mt-1">
                    {t(`payment.status.${team.payment_status}`)}
                  </Badge>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button
                    size="sm"
                    loading={approve.isPending}
                    onClick={() => approve.mutate(team.id)}
                  >
                    {t('admin.approve')}
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    loading={reject.isPending}
                    onClick={() => reject.mutate(team.id)}
                  >
                    {t('admin.reject')}
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
