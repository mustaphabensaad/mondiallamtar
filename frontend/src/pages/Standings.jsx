import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { tournamentService } from '../services/tournament.service';
import Spinner from '../components/ui/Spinner';

function StandingsTable({ group }) {
  const { t } = useTranslation();
  return (
    <div className="card overflow-hidden">
      {/* Group header */}
      <div className="bg-primary/10 dark:bg-primary/20 px-4 py-3 flex items-center gap-2">
        <span className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white text-xs font-black">
          {group.letter}
        </span>
        <h2 className="font-display font-bold">{t('team.group')} {group.letter}</h2>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-light dark:border-border-dark text-xs text-gray-500 uppercase tracking-wide">
              <th className="text-left px-4 py-2">#</th>
              <th className="text-left px-2 py-2">{t('team.name')}</th>
              <th className="px-2 py-2">P</th>
              <th className="px-2 py-2">W</th>
              <th className="px-2 py-2">D</th>
              <th className="px-2 py-2">L</th>
              <th className="px-2 py-2">GF</th>
              <th className="px-2 py-2">GA</th>
              <th className="px-2 py-2">GD</th>
              <th className="px-2 py-2 font-bold text-primary">Pts</th>
            </tr>
          </thead>
          <tbody>
            {group.teams.map((row, i) => (
              <tr
                key={row.team_id}
                className={`border-b border-border-light dark:border-border-dark last:border-0
                  ${i < 2 ? 'bg-primary/5' : ''}`}
              >
                <td className="px-4 py-2.5">
                  <span className={`font-bold text-xs ${i < 2 ? 'text-primary' : 'text-gray-400'}`}>
                    {i + 1}
                  </span>
                </td>
                <td className="px-2 py-2.5">
                  <div className="flex items-center gap-2">
                    <img
                      src={row.team_logo || `https://placehold.co/28x28/16a34a/ffffff?text=${encodeURIComponent((row.team_name||'?')[0])}`}
                      alt={row.team_name}
                      className="w-7 h-7 rounded-lg object-cover shrink-0"
                    />
                    <span className="font-semibold truncate max-w-[140px]">{row.team_name}</span>
                  </div>
                </td>
                <td className="px-2 py-2.5 text-center tabular-nums">{row.played}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-green-600">{row.won}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-yellow-600">{row.drawn}</td>
                <td className="px-2 py-2.5 text-center tabular-nums text-red-500">{row.lost}</td>
                <td className="px-2 py-2.5 text-center tabular-nums">{row.goals_for}</td>
                <td className="px-2 py-2.5 text-center tabular-nums">{row.goals_against}</td>
                <td className="px-2 py-2.5 text-center tabular-nums">
                  <span className={row.goal_diff > 0 ? 'text-green-600' : row.goal_diff < 0 ? 'text-red-500' : ''}>
                    {row.goal_diff > 0 ? '+' : ''}{row.goal_diff}
                  </span>
                </td>
                <td className="px-2 py-2.5 text-center tabular-nums font-black text-primary">{row.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 text-xs text-gray-400 border-t border-border-light dark:border-border-dark">
        <span className="inline-block w-3 h-3 bg-primary/20 rounded mr-1" />
        Top 2 qualify
      </div>
    </div>
  );
}

export default function Standings() {
  const { t } = useTranslation();
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn:  tournamentService.getGroups,
    refetchInterval: 60_000,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="font-display text-2xl font-bold mb-6">{t('nav.standings')}</h1>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : groups.length === 0 ? (
        <p className="text-center text-gray-400 py-16">{t('common.no_data')}</p>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {groups.map(g => <StandingsTable key={g.letter} group={g} />)}
        </div>
      )}
    </div>
  );
}
