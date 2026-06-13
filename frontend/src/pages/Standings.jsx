import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { tournamentService } from '../services/tournament.service';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import ShareCardModal from '../components/share/ShareCardModal';
import GroupShareCard from '../components/share/cards/GroupShareCard';
import { imgUrl } from '../utils/imageUrl';

const COL_HEADER_KEYS = [
  { key: 'played',        label: 'J',   titleKey: 'standings.col_played' },
  { key: 'won',           label: 'G',   titleKey: 'standings.col_won',   color: 'text-green-600 dark:text-green-400' },
  { key: 'drawn',         label: 'N',   titleKey: 'standings.col_drawn', color: 'text-yellow-600 dark:text-yellow-400' },
  { key: 'lost',          label: 'P',   titleKey: 'standings.col_lost',  color: 'text-red-500 dark:text-red-400' },
  { key: 'goals_for',     label: 'BP',  titleKey: 'standings.col_gf' },
  { key: 'goals_against', label: 'BC',  titleKey: 'standings.col_ga' },
  { key: 'goal_diff',     label: '+/-', titleKey: 'standings.col_gd' },
  { key: 'points',        label: 'Pts', titleKey: 'standings.col_pts', bold: true },
];

const GROUP_GRADIENTS = [
  ['from-blue-600 to-indigo-700',    'bg-blue-600/10'],
  ['from-emerald-600 to-green-700',  'bg-emerald-600/10'],
  ['from-purple-600 to-violet-700',  'bg-purple-600/10'],
  ['from-orange-600 to-amber-700',   'bg-orange-600/10'],
  ['from-cyan-600 to-teal-700',      'bg-cyan-600/10'],
  ['from-rose-600 to-pink-700',      'bg-rose-600/10'],
];

const RANK_ICONS = { 1: '🥇', 2: '🥈' };

function StandingsTable({ group, gi, onExport }) {
  const { t } = useTranslation();
  const [grad, rowBg] = GROUP_GRADIENTS[gi % GROUP_GRADIENTS.length];
  const COL_HEADERS = COL_HEADER_KEYS.map(h => ({ ...h, title: t(h.titleKey) }));

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm
      animate-float-up" style={{ animationDelay: `${gi * 80}ms` }}>

      {/* Header */}
      <div className={`bg-gradient-to-r ${grad} px-4 sm:px-5 py-3.5 flex items-center gap-3`}>
        <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center text-white font-black text-base shrink-0">
          {group.letter}
        </div>
        <div>
          <h2 className="font-display font-bold text-white leading-tight">{t('team.group')} {group.letter}</h2>
          <p className="text-white/60 text-[11px]">{group.teams.length} {t('team.teams_count')}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => onExport(group)}
            title="Exporter la carte"
            className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-full text-[10px] text-white/80 font-semibold transition-colors"
          >
            📤
          </button>
          <div className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />
            <span className="text-[10px] text-white/70 font-semibold uppercase tracking-wide">{t('match.live')}</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-[#111827]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
              <th className="text-left px-3 sm:px-4 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-widest w-8">#</th>
              <th className="text-left px-2 py-2.5 text-[10px] font-black text-gray-400 uppercase tracking-widest">{t('standings.team_col')}</th>
              {COL_HEADERS.map(h => (
                <th key={h.key} title={h.title}
                  className={`text-center px-1.5 py-2.5 text-[10px] font-black uppercase tracking-widest w-8
                    ${h.bold ? 'text-primary' : 'text-gray-400'}`}>
                  {h.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {group.teams.map((row, i) => {
              const qualified = i < 2;
              return (
                <tr key={row.team_id}
                  className={`border-b border-gray-50 dark:border-gray-800/50 last:border-0 transition-colors
                    hover:bg-gray-50 dark:hover:bg-gray-800/30
                    ${qualified ? `${rowBg} dark:bg-primary/[0.06]` : ''}`}
                >
                  {/* Rank */}
                  <td className="px-3 sm:px-4 py-3">
                    {qualified ? (
                      <span className="text-base leading-none">{RANK_ICONS[i + 1]}</span>
                    ) : (
                      <span className="text-xs font-bold text-gray-400 tabular-nums">{i + 1}</span>
                    )}
                  </td>

                  {/* Team */}
                  <td className="px-2 py-2.5">
                    <div className="flex items-center gap-2">
                      <img
                        src={imgUrl(row.team_logo) || `https://placehold.co/28x28/16a34a/ffffff?text=${encodeURIComponent((row.team_name || '?')[0])}`}
                        alt={row.team_name}
                        className="w-7 h-7 rounded-lg object-cover shrink-0 shadow-sm"
                      />
                      <div className="min-w-0">
                        <span className={`font-semibold truncate block max-w-[110px] sm:max-w-[150px] text-sm
                          ${qualified ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                          {row.team_name}
                        </span>
                        {qualified && (
                          <span className="text-[9px] bg-primary/10 text-primary px-1 py-0.5 rounded font-black uppercase tracking-wide hidden sm:inline-block mt-0.5">
                            {t('standings.qualified')}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Stats */}
                  {COL_HEADERS.map(h => (
                    <td key={h.key} className={`text-center px-1.5 py-2.5 tabular-nums text-sm
                      ${h.bold
                        ? 'font-black text-primary text-base'
                        : h.key === 'goal_diff'
                          ? ''
                          : h.color || 'text-gray-600 dark:text-gray-400'
                      }`}>
                      {h.key === 'goal_diff'
                        ? <span className={
                            row.goal_diff > 0 ? 'text-green-600 dark:text-green-400 font-bold' :
                            row.goal_diff < 0 ? 'text-red-500 dark:text-red-400 font-bold' :
                            'text-gray-400'
                          }>
                            {row.goal_diff > 0 ? `+${row.goal_diff}` : row.goal_diff}
                          </span>
                        : <span className={h.bold ? '' : 'font-medium'}>{row[h.key]}</span>
                      }
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2 text-xs text-gray-400">
        <span>🥇🥈</span>
        <span>{t('standings.top2_legend')}</span>
      </div>

    </div>
  );
}

export default function Standings() {
  const { t } = useTranslation();
  const [exportGroup, setExportGroup] = useState(null);

  const { data: groups = [], isLoading } = useQuery({
    queryKey: ['groups'],
    queryFn:  tournamentService.getGroups,
    refetchInterval: 60_000,
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-header mb-1">{t('nav.standings')}</h1>
          <p className="text-gray-500 text-sm">
            {t('standings.updated_live')} ·{' '}
            <span className="font-semibold text-primary">{groups.length}</span> {t('standings.groups_count')}
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs bg-primary/5 border border-primary/20 text-primary px-3 py-1.5 rounded-full font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          {t('match.live')}
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : groups.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="📊"
            title={t('standings.no_title')}
            subtitle={t('standings.no_sub')}
            color="blue"
            size="lg"
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {groups.map((g, i) => (
            <StandingsTable key={g.letter} group={g} gi={i} onExport={setExportGroup} />
          ))}
        </div>
      )}

      {/* Modal lives here — outside any transformed ancestor */}
      <ShareCardModal
        isOpen={!!exportGroup}
        onClose={() => setExportGroup(null)}
        title={exportGroup ? `Groupe ${exportGroup.letter}` : ''}
        filename={exportGroup ? `groupe-${exportGroup.letter}.png` : 'groupe.png'}
      >
        {exportGroup && <GroupShareCard group={exportGroup} />}
      </ShareCardModal>
    </div>
  );
}
