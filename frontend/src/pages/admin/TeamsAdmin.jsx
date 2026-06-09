import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/tournament.service';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const TABS = ['all', 'pending'];

export default function TeamsAdmin() {
  const { t } = useTranslation();
  const qc    = useQueryClient();
  const [tab, setTab] = useState('all');

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
    onSuccess:  () => { qc.invalidateQueries(['admin-teams-all']); qc.invalidateQueries(['admin-teams-pending']); toast.success('Team approved'); },
    onError:    () => toast.error('Error'),
  });
  const rejectMut = useMutation({
    mutationFn: adminService.rejectTeam,
    onSuccess:  () => { qc.invalidateQueries(['admin-teams-all']); qc.invalidateQueries(['admin-teams-pending']); toast.success('Team rejected'); },
    onError:    () => toast.error('Error'),
  });
  const payMut = useMutation({
    mutationFn: adminService.confirmPayment,
    onSuccess:  () => { qc.invalidateQueries(['admin-teams-all']); toast.success('Payment confirmed'); },
    onError:    () => toast.error('Error'),
  });

  const teams   = tab === 'pending' ? pending   : allTeams;
  const loading = tab === 'pending' ? pendingLoading : allLoading;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
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
              <div key={team.id} className="flex items-center gap-3 px-4 py-4">
                <img
                  src={team.logo_path || `https://placehold.co/44x44/16a34a/ffffff?text=${encodeURIComponent((team.name || '?')[0])}`}
                  alt={team.name}
                  className="w-11 h-11 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{team.name}</p>
                  <p className="text-xs text-gray-500">
                    Coach: {team.coach_name}
                    {team.group_letter && <span className="ml-2 text-primary font-bold">Group {team.group_letter}</span>}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  <Badge variant={team.status}>{team.status}</Badge>
                  <Badge variant={team.payment_status || 'unpaid'}>{team.payment_status || 'unpaid'}</Badge>

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
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
