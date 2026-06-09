import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { tournamentService } from '../services/tournament.service';
import Spinner from '../components/ui/Spinner';

const COL_HEADERS = [
  { key: 'played',        label: 'J',   title: 'Joués'   },
  { key: 'won',           label: 'G',   title: 'Gagnés',  color: 'text-green-600 dark:text-green-400' },
  { key: 'drawn',         label: 'N',   title: 'Nuls',    color: 'text-yellow-600 dark:text-yellow-400' },
  { key: 'lost',          label: 'P',   title: 'Perdus',  color: 'text-red-500' },
  { key: 'goals_for',     label: 'BP',  title: 'Buts pour' },
  { key: 'goals_against', label: 'BC',  title: 'Buts contre' },
  { key: 'goal_diff',     label: '+/-', title: 'Diff' },
  { key: 'points',        label: 'Pts', title: 'Points',  bold: true },
];

const GROUP_GRADIENTS = [
  'from-blue-600 to-indigo-700',
  'from-green-600 to-emerald-700',
  'from-purple-600 to-violet-700',
  'from-orange-600 to-amber-700',
];

function StandingsTable({ group, gi }) {
  const { t } = useTranslation();
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
      {/* Group header */}
      <div className={`bg-gradient-to-r ${GROUP_GRADIENTS[gi % GROUP_GRADIENTS.length]} px-5 py-3.5 flex items-center gap-3`}>
        <span className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white font-black text-sm">
          {group.letter}
        </span>
        <h2 className="font-display font-bold text-white">{t('team.group')} {group.letter}</h2>
        <span className="ml-auto text-white/60 text-xs">{group.teams.length} équipes</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-[#111827]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="text-left px-4 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-wide w-6">#</th>
              <th className="text-left px-2 py-2.5 text-xs font-bold text-gray-400 uppercase tracking-wide">Équipe</th>
              {COL_HEADERS.map(h => (
                <th key={h.key} title={h.title}
                  className={`text-center px-2 py-2.5 text-xs font-bold uppercase tracking-wide w-9 ${h.bold ? 'text-primary' : 'text-gray-400'}`}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {group.teams.map((row, i) => (
              <tr key={row.team_id}
                className={`
                  border-b border-gray-50 dark:border-gray-800/50 last:border-0
                  transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30
                  ${i < 2 ? 'bg-primary/[0.03] dark:bg-primary/[0.05]' : ''}
                `}
              >
                {/* Rank */}
                <td className="px-4 py-3">
                  {i < 2 ? (
                    <span className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center text-white text-xs font-black">
                      {i + 1}
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-gray-400 pl-1">{i + 1}</span>
                  )}
                </td>

                {/* Team */}
                <td className="px-2 py-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={row.team_logo || `https://placehold.co/28x28/16a34a/ffffff?text=${encodeURIComponent((row.team_name||'?')[0])}`}
                      alt={row.team_name}
                      className="w-7 h-7 rounded-lg object-cover shrink-0"
                    />
                    <span className={`font-semibold truncate max-w-[130px] ${i < 2 ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                      {row.team_name}
                    </span>
                    {i < 2 && (
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-md font-bold hidden sm:inline">Q</span>
                    )}
                  </div>
                </td>

                {/* Stats */}
                {COL_HEADERS.map(h => (
                  <td key={h.key} className={`text-center px-2 py-3 tabular-nums ${
                    h.bold ? 'font-black text-primary text-base' :
                    h.color || 'text-gray-600 dark:text-gray-400'
                  }`}>
                    {h.key === 'goal_diff'
                      ? <span className={row.goal_diff > 0 ? 'text-green-600 dark:text-green-400' : row.goal_diff < 0 ? 'text-red-500' : 'text-gray-400'}>
                          {row.goal_diff > 0 ? `+${row.goal_diff}` : row.goal_diff}
                        </span>
                      : row[h.key]
                    }
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 text-xs text-gray-400">
        <span className="w-3 h-3 rounded-sm bg-primary/20 inline-block" />
        <span>Top 2 se qualifient pour les quarts de finale</span>
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-header mb-1">{t('nav.standings')}</h1>
          <p className="text-gray-500 text-sm">Mis à jour en temps réel · {groups.length} groupes</p>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs bg-primary/5 border border-primary/20 text-primary px-3 py-1.5 rounded-full font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
          Live
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : groups.length === 0 ? (
        <div className="card p-16 text-center">
          <p className="text-5xl mb-4">📊</p>
          <p className="text-gray-500 font-semibold">{t('common.no_data')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {groups.map((g, i) => <StandingsTable key={g.letter} group={g} gi={i} />)}
        </div>
      )}
    </div>
  );
}
