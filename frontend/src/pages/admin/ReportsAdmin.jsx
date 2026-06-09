import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/tournament.service';
import Spinner from '../../components/ui/Spinner';

function StatBox({ label, value, color = 'text-primary' }) {
  return (
    <div className="card p-4 text-center">
      <p className={`text-3xl font-black ${color}`}>{value ?? '—'}</p>
      <p className="text-xs text-gray-400 mt-1">{label}</p>
    </div>
  );
}

export default function ReportsAdmin() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn:  adminService.getReports,
  });

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  const s = data || {};

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/admin" className="text-sm text-primary hover:underline mb-4 inline-block">← Dashboard</Link>
      <h1 className="font-display text-2xl font-bold mb-6">Reports &amp; Statistics</h1>

      {/* Overall stats */}
      <h2 className="font-display font-bold text-sm text-gray-500 uppercase tracking-wider mb-3">Overview</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatBox label="Total Teams"    value={s.total_teams}   />
        <StatBox label="Approved Teams" value={s.approved_teams} color="text-green-600" />
        <StatBox label="Total Players"  value={s.total_players} />
        <StatBox label="Total Matches"  value={s.total_matches} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatBox label="Goals Scored"     value={s.total_goals}        color="text-primary" />
        <StatBox label="Yellow Cards"     value={s.total_yellow_cards} color="text-yellow-500" />
        <StatBox label="Red Cards"        value={s.total_red_cards}    color="text-red-500" />
        <StatBox label="Payments Paid"    value={s.payments_paid}      color="text-blue-500" />
      </div>

      {/* Top scorers */}
      {s.top_scorers?.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display font-bold text-sm text-gray-500 uppercase tracking-wider mb-3">Top Scorers</h2>
          <div className="card overflow-hidden">
            <div className="divide-y divide-border-light dark:divide-border-dark">
              {s.top_scorers.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <span className={`w-7 text-center font-black text-sm shrink-0 ${i === 0 ? 'text-gold' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-amber-600' : 'text-gray-500'}`}>
                    {i + 1}
                  </span>
                  <img
                    src={p.photo_path || `https://placehold.co/36x36/16a34a/ffffff?text=${encodeURIComponent((p.first_name || '?')[0])}`}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{p.first_name} {p.last_name}</p>
                    <p className="text-xs text-gray-500">{p.team_name}</p>
                  </div>
                  <span className="font-black text-primary text-lg shrink-0">⚽ {p.goals}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fines */}
      {s.fines?.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-sm text-gray-500 uppercase tracking-wider mb-3">Recent Fines</h2>
          <div className="card overflow-hidden">
            <div className="divide-y divide-border-light dark:divide-border-dark">
              {s.fines.map(f => (
                <div key={f.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{f.player_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{f.reason}</p>
                  </div>
                  <span className="font-black text-red-500 shrink-0">{f.amount?.toLocaleString()} DZD</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
