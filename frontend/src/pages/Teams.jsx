import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { teamService } from '../services/tournament.service';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

function TeamCard({ team }) {
  const { t } = useTranslation();
  return (
    <Link to={`/teams/${team.id}`} className="block">
      <div className="card p-4 hover:shadow-md transition-shadow flex items-center gap-4">
        <img
          src={team.logo_path || `https://placehold.co/56x56/16a34a/ffffff?text=${encodeURIComponent((team.name||'?')[0])}`}
          alt={team.name}
          className="w-14 h-14 rounded-xl object-cover shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold truncate">{team.name}</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{t('team.coach')}: {team.coach_name}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <Badge variant={team.status}>{t(`team.status.${team.status}`)}</Badge>
            {team.group_letter && (
              <span className="text-xs font-semibold bg-secondary/10 text-secondary px-2 py-0.5 rounded-full">
                {t('team.group')} {team.group_letter}
              </span>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xl font-black text-primary">{team.player_count}</p>
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

  // Group by group letter
  const byGroup = teams.reduce((acc, team) => {
    const g = team.group_letter || '?';
    if (!acc[g]) acc[g] = [];
    acc[g].push(team);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-6">{t('nav.teams')}</h1>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : teams.length === 0 ? (
        <p className="text-center text-gray-400 py-16">{t('common.no_data')}</p>
      ) : (
        <div className="flex flex-col gap-8">
          {Object.entries(byGroup).sort(([a], [b]) => a.localeCompare(b)).map(([letter, groupTeams]) => (
            <div key={letter}>
              <h2 className="font-display font-bold text-lg mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-sm font-black">
                  {letter}
                </span>
                {t('team.group')} {letter}
              </h2>
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
