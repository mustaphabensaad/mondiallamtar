import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { teamService } from '../../services/tournament.service';
import { useAuth } from '../../hooks/useAuth';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

function StatCard({ value, label, color = 'text-primary' }) {
  return (
    <div className="card p-4 text-center">
      <p className={`text-3xl font-black ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}

export default function CaptainDashboard() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['my-team'],
    queryFn:  teamService.getMyTeam,
  });

  const team    = data?.team;
  const players = data?.players || [];

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-2">{t('nav.dashboard')}</h1>
      <p className="text-gray-500 text-sm mb-6">{user?.email}</p>

      {!team ? (
        <div className="card p-8 text-center">
          <p className="text-gray-400 mb-4">You haven't registered a team yet.</p>
          <Link to="/captain/team" className="btn-primary">Register Team</Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Team card */}
          <div className="card p-5 flex items-center gap-4">
            <img
              src={team.logo_path || `https://placehold.co/64x64/16a34a/ffffff?text=${encodeURIComponent((team.name||'?')[0])}`}
              alt={team.name}
              className="w-16 h-16 rounded-xl object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <h2 className="font-display font-bold text-xl">{team.name}</h2>
              <p className="text-sm text-gray-500">{t('team.coach')}: {team.coach_name}</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Badge variant={team.status}>{t(`team.status.${team.status}`)}</Badge>
                <Badge variant={team.payment_status}>{t(`payment.status.${team.payment_status}`)}</Badge>
                {team.group_letter && (
                  <span className="text-xs font-semibold bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                    {t('team.group')} {team.group_letter}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard value={players.length} label={t('team.players')} />
            <StatCard value={players.filter(p => p.is_validated).length} label="Validated" color="text-green-600" />
            <StatCard value={players.filter(p => p.goals > 0).reduce((s, p) => s + p.goals, 0)} label="Goals" color="text-gold" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 flex-wrap">
            <Link to="/captain/invites" className="btn-primary">Manage Players</Link>
            <Link to="/captain/payment" className="btn-secondary">Payment</Link>
          </div>

          {/* Players list */}
          <div className="card overflow-hidden">
            <div className="px-4 py-3 border-b border-border-light dark:border-border-dark">
              <h3 className="font-bold">{t('team.players')}</h3>
            </div>
            <div className="divide-y divide-border-light dark:divide-border-dark">
              {players.map(p => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-8 text-center text-xs font-bold text-gray-400">#{p.jersey_number}</span>
                  <img
                    src={p.photo_path || `https://placehold.co/36x36/1e40af/ffffff?text=${encodeURIComponent((p.first_name||'?')[0])}`}
                    alt={`${p.first_name} ${p.last_name}`}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{p.first_name} {p.last_name}</p>
                    <p className="text-xs text-gray-500">{t(`player.positions.${p.position}`)}</p>
                  </div>
                  <Badge variant={p.is_validated ? 'approved' : 'pending'}>
                    {p.is_validated ? 'Active' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
