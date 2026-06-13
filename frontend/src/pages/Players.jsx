import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { playerService } from '../services/tournament.service';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import PlayerModal from '../components/ui/PlayerModal';
import { imgUrl } from '../utils/imageUrl';

const POSITION_META = {
  GK:  { color: 'bg-yellow-500',  text: 'text-yellow-600 dark:text-yellow-400',  border: 'border-yellow-400/40', glow: 'shadow-yellow-200/50 dark:shadow-yellow-900/20' },
  DEF: { color: 'bg-blue-500',    text: 'text-blue-600 dark:text-blue-400',      border: 'border-blue-400/40',   glow: 'shadow-blue-200/50 dark:shadow-blue-900/20'   },
  MID: { color: 'bg-green-500',   text: 'text-green-600 dark:text-green-400',    border: 'border-green-400/40',  glow: 'shadow-green-200/50 dark:shadow-green-900/20' },
  FWD: { color: 'bg-red-500',     text: 'text-red-600 dark:text-red-400',        border: 'border-red-400/40',    glow: 'shadow-red-200/50 dark:shadow-red-900/20'     },
};

const POSITIONS = ['all', 'GK', 'DEF', 'MID', 'FWD'];

// ── Single player card ─────────────────────────────────────────────────────────
function PlayerCard({ player, onClick }) {
  const { t } = useTranslation();
  const [imgError, setImgError] = useState(false);
  const pos  = POSITION_META[player.position] || POSITION_META.MID;
  const age  = player.date_of_birth
    ? Math.floor((Date.now() - new Date(player.date_of_birth)) / (365.25 * 24 * 3600 * 1000))
    : null;
  const photo = imgUrl(player.photo_path);
  const initials = `${(player.first_name || '?')[0]}${(player.last_name || '')[0] || ''}`.toUpperCase();
  const showPhoto = photo && !imgError;

  return (
    <div
      onClick={onClick}
      className={`
        group relative flex flex-col overflow-hidden rounded-2xl cursor-pointer
        bg-white dark:bg-gray-900
        border border-gray-200/80 dark:border-gray-800
        shadow-md hover:shadow-xl ${pos.glow}
        hover:-translate-y-1 transition-all duration-300
      `}
    >
      {/* Top color strip */}
      <div className={`h-1.5 w-full ${pos.color}`} />

      {/* Jersey number badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className={`
          inline-flex items-center justify-center w-8 h-8 rounded-full
          text-xs font-black bg-white dark:bg-gray-800
          border-2 ${pos.border} ${pos.text} shadow-sm
        `}>
          {player.jersey_number ?? '—'}
        </span>
      </div>

      {/* Photo + identity */}
      <div className="flex flex-col items-center pt-6 pb-4 px-5">
        <div className={`relative w-20 h-20 rounded-2xl overflow-hidden ring-2 ${pos.border} shadow-lg mb-3 shrink-0`}>
          {showPhoto ? (
            <img
              src={photo}
              alt={`${player.first_name} ${player.last_name}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center text-white font-black text-xl ${pos.color}`}>
              {initials}
            </div>
          )}
        </div>

        <h3 className="font-display font-black text-base text-gray-900 dark:text-white text-center leading-tight flex items-center justify-center gap-1.5">
          {player.first_name} {player.last_name}
          {!!player.is_captain && <span className="text-amber-500 text-sm" title={t('player.is_captain')}>👑</span>}
        </h3>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap justify-center">
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${pos.color} text-white`}>
            {t(`player.positions.${player.position}`)}
          </span>
          {age && (
            <span className="text-[11px] text-gray-400 font-medium">{age} {t('player.years')}</span>
          )}
          {!player.is_validated && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
              {t('player.pending_status')}
            </span>
          )}
        </div>
      </div>

      {/* Team */}
      <Link
        to={`/teams/${player.team_id}`}
        className="mx-4 mb-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-gray-800/60 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors group/team"
      >
        <img
          src={imgUrl(player.team_logo) || `https://placehold.co/28x28/16a34a/ffffff?text=${encodeURIComponent((player.team_name || '?')[0])}`}
          alt={player.team_name}
          className="w-7 h-7 rounded-lg object-cover shrink-0"
        />
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate group-hover/team:text-primary transition-colors">
          {player.team_name}
        </span>
      </Link>

      {/* Bio */}
      {player.bio && (
        <div className="mx-4 mb-3 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t('player.experience')}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">
            {player.bio}
          </p>
        </div>
      )}

      {/* Stats row */}
      <div className="mt-auto mx-4 mb-4 grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
        <StatCell icon="⚽" value={player.goals}        label={t('player.goals')}        highlight={player.goals > 0}        color="text-green-600 dark:text-green-400" />
        <StatCell icon="🟨" value={player.yellow_cards} label={t('player.yellow_cards')} highlight={player.yellow_cards > 0} color="text-yellow-600 dark:text-yellow-400" />
        <StatCell icon="🟥" value={player.red_cards}    label={t('player.red_cards')}    highlight={player.red_cards > 0}    color="text-red-500" />
      </div>
    </div>
  );
}

function StatCell({ icon, value, label, highlight, color }) {
  return (
    <div className="flex flex-col items-center py-2.5 px-1 bg-white dark:bg-gray-900">
      <span className="text-sm leading-none mb-0.5">{icon}</span>
      <span className={`text-base font-black tabular-nums ${highlight ? color : 'text-gray-300 dark:text-gray-600'}`}>
        {value ?? 0}
      </span>
      <span className="text-[9px] text-gray-400 uppercase tracking-wider font-semibold mt-0.5">{label}</span>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function Players() {
  const { t } = useTranslation();
  const [position, setPosition] = useState('all');
  const [search,   setSearch]   = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);

  const { data: players = [], isLoading } = useQuery({
    queryKey: ['players-all'],
    queryFn:  playerService.getAll,
  });

  const teams = useMemo(() => {
    const map = {};
    players.forEach(p => { map[p.team_id] = p.team_name; });
    return Object.entries(map).map(([id, name]) => ({ id: Number(id), name }));
  }, [players]);

  const filtered = useMemo(() => {
    let list = players;
    if (position !== 'all') list = list.filter(p => p.position === position);
    if (teamFilter !== 'all') list = list.filter(p => p.team_id === Number(teamFilter));
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p =>
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(q) ||
        p.team_name?.toLowerCase().includes(q) ||
        p.bio?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [players, position, teamFilter, search]);

  const totalGoals = players.reduce((s, p) => s + (p.goals || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {selectedId && <PlayerModal playerId={selectedId} onClose={() => setSelectedId(null)} />}

      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-black text-gray-900 dark:text-white">
            {t('player.page_title')}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {players.length} {t('player.registered_count')} · {totalGoals} {t('player.goals_total')}
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder={t('player.search')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input w-full pl-8 text-sm"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {/* Position tabs */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
          {POSITIONS.map(pos => {
            const meta = POSITION_META[pos];
            const active = position === pos;
            return (
              <button
                key={pos}
                onClick={() => setPosition(pos)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  active
                    ? pos === 'all'
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm'
                      : `${meta.color} text-white shadow-sm`
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {pos === 'all' ? t('player.all_positions') : t(`player.positions.${pos}`)}
              </button>
            );
          })}
        </div>

        {/* Team filter */}
        {teams.length > 1 && (
          <select
            value={teamFilter}
            onChange={e => setTeamFilter(e.target.value)}
            className="input text-sm py-1.5 px-3 rounded-xl"
          >
            <option value="all">{t('player.all_teams')}</option>
            {teams.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        )}

        {/* Result count */}
        {(position !== 'all' || teamFilter !== 'all' || search) && (
          <span className="flex items-center text-xs text-gray-400 font-medium">
            {filtered.length} {t('player.registered_count')}
            <button
              onClick={() => { setPosition('all'); setTeamFilter('all'); setSearch(''); }}
              className="ml-2 text-primary hover:underline"
            >
              {t('player.reset')}
            </button>
          </span>
        )}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-24"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon="👤"
          title={search || position !== 'all' ? t('player.no_found') : t('player.none_registered')}
          subtitle={search || position !== 'all' ? t('player.no_found_sub') : t('player.none_registered_sub')}
          color="blue"
          size="lg"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map(p => <PlayerCard key={p.id} player={p} onClick={() => setSelectedId(p.id)} />)}
        </div>
      )}
    </div>
  );
}
