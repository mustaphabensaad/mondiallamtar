import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { teamService } from '../services/tournament.service';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

const GROUP_COLORS = ['from-blue-500 to-indigo-600', 'from-green-500 to-emerald-600', 'from-purple-500 to-violet-600', 'from-orange-500 to-amber-600'];

function TeamCard({ team }) {
  const { t } = useTranslation();
  return (
    <Link to={`/teams/${team.id}`} className="block group">
      <div className="card-hover flex items-center gap-4 p-4">
        <div className="relative shrink-0">
          <img
            src={team.logo_path || `https://placehold.co/56x56/16a34a/ffffff?text=${encodeURIComponent((team.name||'?')[0])}`}
            alt={team.name}
            className="w-14 h-14 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-200"
          />
          {team.status === 'approved' && (
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-[#111827]" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
            {team.name}
          </p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">
            🧑‍💼 {team.coach_name}
          </p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant={team.status}>{t(`team.status.${team.status}`)}</Badge>
            {team.group_letter && (
              <span className="text-xs font-bold bg-secondary/10 text-secondary dark:text-blue-400 px-2 py-0.5 rounded-full border border-secondary/20">
                {t('team.group')} {team.group_letter}
              </span>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <p className="text-2xl font-black text-primary">{team.player_count}</p>
          <p className="text-xs text-gray-400">{t('team.players')}</p>
        </div>
      </div>
    </Link>
  );
}

export default function Teams() {
  const { t } = useTranslation();
  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn:  () => teamService.getAll({ status: 'approved' }),
  });

  const byGroup = teams.reduce((acc, team) => {
    const g = team.group_letter || '?';
    if (!acc[g]) acc[g] = [];
    acc[g].push(team);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-header mb-1">{t('nav.teams')}</h1>
          <p className="text-gray-500 text-sm">{teams.length} équipes qualifiées</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : teams.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-5xl mb-4">🏟️</p>
          <p className="text-gray-500 font-semibold">{t('common.no_data')}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {Object.entries(byGroup).sort(([a], [b]) => a.localeCompare(b)).map(([letter, groupTeams], gi) => (
            <div key={letter}>
              {/* Group header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${GROUP_COLORS[gi % GROUP_COLORS.length]} flex items-center justify-center text-white font-black text-base shadow-sm`}>
                  {letter}
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg">{t('team.group')} {letter}</h2>
                  <p className="text-xs text-gray-400">{groupTeams.length} équipes</p>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent ml-2" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {groupTeams.map(t => <TeamCard key={t.id} team={t} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
