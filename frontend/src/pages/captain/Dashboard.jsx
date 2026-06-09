import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { teamService } from '../../services/tournament.service';
import { useAuth } from '../../hooks/useAuth';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';

const POS_COLOR = { GK: 'bg-yellow-500', DEF: 'bg-blue-500', MID: 'bg-green-500', FWD: 'bg-red-500' };

function StatCard({ value, label, icon, gradient }) {
  return (
    <div className={`rounded-2xl border p-5 text-center bg-gradient-to-br ${gradient}`}>
      <p className="text-2xl mb-1">{icon}</p>
      <p className="text-3xl font-black text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </div>
  );
}

function ActionCard({ to, icon, label, desc, color }) {
  return (
    <Link to={to} className="group block">
      <div className="card-hover p-4 flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center text-xl shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors">{label}</p>
          <p className="text-xs text-gray-500 truncate">{desc}</p>
        </div>
        <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 shrink-0 group-hover:text-primary group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
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

  if (!team) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="card p-12">
          <p className="text-6xl mb-4">🏟️</p>
          <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-2">
            Pas encore d'équipe
          </h2>
          <p className="text-gray-500 text-sm mb-6">Créez votre équipe pour participer au Mundial Lamtar 2026</p>
          <Link to="/captain/team" className="btn-primary">Créer mon équipe</Link>
        </div>
      </div>
    );
  }

  const validated = players.filter(p => p.is_validated).length;
  const totalGoals = players.reduce((s, p) => s + (p.goals || 0), 0);
  const paymentOk = team.payment_status === 'paid';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-header mb-0">{t('nav.dashboard')}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{user?.email}</p>
        </div>
      </div>

      {/* Team hero card */}
      <div className="relative overflow-hidden rounded-3xl mb-6 bg-gradient-to-br from-gray-900 via-green-950/50 to-gray-900 p-6 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(22,163,74,0.15),transparent_60%)] pointer-events-none" />
        <div className="relative flex items-center gap-5">
          <img
            src={team.logo_path || `https://placehold.co/72x72/16a34a/ffffff?text=${encodeURIComponent((team.name||'?')[0])}`}
            alt={team.name}
            className="w-18 h-18 rounded-2xl object-cover shadow-lg ring-2 ring-white/10 shrink-0"
            style={{ width: 72, height: 72 }}
          />
          <div className="flex-1 min-w-0">
            <h2 className="font-display font-black text-xl text-white mb-1">{team.name}</h2>
            <p className="text-green-400/80 text-sm mb-3">🧑‍💼 {team.coach_name}</p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant={team.status}>{t(`team.status.${team.status}`)}</Badge>
              <Badge variant={team.payment_status}>{t(`payment.status.${team.payment_status}`)}</Badge>
              {team.group_letter && (
                <span className="text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full">
                  {t('team.group')} {team.group_letter}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Payment warning */}
        {!paymentOk && (
          <div className="relative mt-4 bg-amber-500/20 border border-amber-500/30 rounded-xl px-4 py-2.5 flex items-center gap-2 text-amber-300 text-xs">
            <span className="text-base">⚠️</span>
            <span>Paiement en attente · <Link to="/captain/payment" className="underline font-bold">Compléter le paiement</Link></span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <StatCard
          value={players.length} label={t('team.players')} icon="👥"
          gradient="from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800"
        />
        <StatCard
          value={validated} label="Validés" icon="✅"
          gradient="from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800"
        />
        <StatCard
          value={totalGoals} label="Buts" icon="⚽"
          gradient="from-amber-50 to-yellow-50 border-amber-200 dark:from-amber-900/20 dark:to-yellow-900/20 dark:border-amber-800"
        />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <ActionCard to="/captain/invites"  icon="📨" label="Gérer les joueurs"  desc="Invitations & roster" color="bg-blue-100 dark:bg-blue-900/30" />
        <ActionCard to="/captain/payment"  icon="💳" label="Paiement"           desc={paymentOk ? '✓ Confirmé' : '8 000 DZD en attente'} color="bg-green-100 dark:bg-green-900/30" />
        <ActionCard to="/captain/team"     icon="⚙️" label="Mon équipe"         desc="Modifier les infos"   color="bg-purple-100 dark:bg-purple-900/30" />
        <ActionCard to="/captain/my-team"  icon="👕" label="Effectif complet"   desc="Voir tous les joueurs" color="bg-orange-100 dark:bg-orange-900/30" />
      </div>

      {/* Players table */}
      {players.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800">
          <div className="px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-800/40">
            <h3 className="font-bold text-sm text-gray-900 dark:text-white">{t('team.players')}</h3>
            <span className="text-xs text-gray-400">{players.length} joueurs</span>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800 bg-white dark:bg-[#111827]">
            {players.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                <span className="w-7 text-center text-xs font-bold text-gray-400 shrink-0">
                  {p.jersey_number ? `#${p.jersey_number}` : '—'}
                </span>
                <img
                  src={p.photo_path || `https://placehold.co/36x36/1e40af/ffffff?text=${encodeURIComponent((p.first_name||'?')[0])}`}
                  alt={`${p.first_name} ${p.last_name}`}
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {p.first_name} {p.last_name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${POS_COLOR[p.position] || 'bg-gray-400'}`} />
                    <p className="text-xs text-gray-500">{t(`player.positions.${p.position}`)}</p>
                  </div>
                </div>
                <Badge variant={p.is_validated ? 'approved' : 'pending'}>
                  {p.is_validated ? 'Actif' : 'En attente'}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
