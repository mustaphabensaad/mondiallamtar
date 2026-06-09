import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { teamService } from '../services/tournament.service';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';

const GROUP_GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-green-600',
  'from-purple-500 to-violet-600',
  'from-orange-500 to-amber-600',
  'from-cyan-500 to-teal-600',
  'from-rose-500 to-pink-600',
  'from-yellow-500 to-amber-500',
  'from-sky-500 to-blue-600',
];
const GROUP_SHADOWS = [
  'shadow-blue-500/25',
  'shadow-emerald-500/25',
  'shadow-purple-500/25',
  'shadow-orange-500/25',
  'shadow-cyan-500/25',
  'shadow-rose-500/25',
  'shadow-yellow-500/25',
  'shadow-sky-500/25',
];

function TeamCard({ team }) {
  const { t } = useTranslation();
  return (
    <Link to={`/teams/${team.id}`} className="block group">
      <div className="card-hover flex items-center gap-3.5 p-4">
        {/* Logo */}
        <div className="relative shrink-0">
          <img
            src={team.logo_path || `https://placehold.co/56x56/16a34a/ffffff?text=${encodeURIComponent((team.name || '?')[0])}`}
            alt={team.name}
            className="w-14 h-14 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-200"
          />
          {team.status === 'approved' && (
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-[#111827] shadow-sm" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors text-[15px]">
            {team.name}
          </p>
          {team.coach_name && (
            <p className="text-xs text-gray-500 mt-0.5 truncate flex items-center gap-1">
              <span>🧑‍💼</span>
              <span>{team.coach_name}</span>
            </p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant={team.status}>{t(`team.status.${team.status}`)}</Badge>
            {team.group_letter && (
              <span className="text-xs font-bold bg-secondary/10 text-secondary dark:text-blue-400 px-2 py-0.5 rounded-full border border-secondary/20">
                {t('team.group')} {team.group_letter}
              </span>
            )}
          </div>
        </div>

        {/* Player count */}
        <div className="text-right shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/10">
          <p className="text-xl font-black text-primary leading-none">{team.player_count ?? 0}</p>
          <p className="text-[9px] text-gray-400 font-medium mt-0.5">joueurs</p>
        </div>
      </div>
    </Link>
  );
}

export default function Teams() {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState('group'); // 'group' | 'all'

  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn:  () => teamService.getAll({ status: 'approved' }),
  });

  const byGroup = teams.reduce((acc, team) => {
    const g = team.group_letter || '_';
    if (!acc[g]) acc[g] = [];
    acc[g].push(team);
    return acc;
  }, {});

  const hasGroups = Object.keys(byGroup).some(k => k !== '_');

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-header mb-1">{t('nav.teams')}</h1>
          <p className="text-gray-500 text-sm">
            <span className="font-semibold text-primary">{teams.length}</span> équipes participantes
          </p>
        </div>

        {/* View toggle */}
        {hasGroups && (
          <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <button
              onClick={() => setViewMode('group')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'group'
                  ? 'bg-white dark:bg-[#111827] text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Par groupe
            </button>
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                viewMode === 'all'
                  ? 'bg-white dark:bg-[#111827] text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Tous
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : teams.length === 0 ? (
        <div className="card">
          <EmptyState
            icon="🏟️"
            title="Inscriptions en cours"
            subtitle="Aucune équipe approuvée pour le moment. Les équipes apparaîtront ici après validation."
            color="green"
            size="lg"
          />
        </div>
      ) : viewMode === 'all' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {teams.map(team => <TeamCard key={team.id} team={team} />)}
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          {Object.entries(byGroup).sort(([a], [b]) => a.localeCompare(b)).map(([letter, groupTeams], gi) => (
            <div key={letter} className="animate-float-up" style={{ animationDelay: `${gi * 60}ms` }}>
              {/* Group header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${GROUP_GRADIENTS[gi % GROUP_GRADIENTS.length]}
                  flex items-center justify-center text-white font-black text-base
                  shadow-lg ${GROUP_SHADOWS[gi % GROUP_SHADOWS.length]}`}>
                  {letter === '_' ? '?' : letter}
                </div>
                <div>
                  <h2 className="font-display font-bold text-lg leading-tight">
                    {letter === '_' ? 'Sans groupe' : `${t('team.group')} ${letter}`}
                  </h2>
                  <p className="text-xs text-gray-400">
                    {groupTeams.length} équipe{groupTeams.length > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-gray-700 to-transparent ml-2" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {groupTeams.map(team => <TeamCard key={team.id} team={team} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
