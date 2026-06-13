import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { matchService, teamService, refereeService } from '../../services/tournament.service';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import ShareCardModal from '../../components/share/ShareCardModal';
import MatchResultCard from '../../components/share/cards/MatchResultCard';

const QUICK_ACTIONS = [
  { key: 'goal',            icon: '⚽', label: 'Goal',       bg: 'bg-emerald-500 hover:bg-emerald-600', ring: 'ring-emerald-400' },
  { key: 'own_goal',        icon: '⚽', label: 'Own Goal',   bg: 'bg-orange-500 hover:bg-orange-600',  ring: 'ring-orange-400'  },
  { key: 'penalty_scored',  icon: '⚽', label: 'Penalty',    bg: 'bg-teal-500 hover:bg-teal-600',      ring: 'ring-teal-400'    },
  { key: 'yellow_card',     icon: '🟨', label: 'Yellow',     bg: 'bg-yellow-500 hover:bg-yellow-600',  ring: 'ring-yellow-400'  },
  { key: 'red_card',        icon: '🟥', label: 'Red Card',   bg: 'bg-red-600 hover:bg-red-700',        ring: 'ring-red-400'     },
  { key: 'substitution_in', icon: '↕',  label: 'Sub',        bg: 'bg-blue-500 hover:bg-blue-600',      ring: 'ring-blue-400'    },
];

const EVENT_META = {
  goal:             { icon: '⚽', label: 'Goal',          row: 'bg-emerald-50 dark:bg-emerald-900/20 border-l-2 border-emerald-400' },
  own_goal:         { icon: '⚽', label: 'Own Goal',      row: 'bg-orange-50 dark:bg-orange-900/20 border-l-2 border-orange-400'   },
  penalty_scored:   { icon: '⚽', label: 'Penalty ✓',     row: 'bg-teal-50 dark:bg-teal-900/20 border-l-2 border-teal-400'        },
  penalty_missed:   { icon: '✗',  label: 'Penalty ✗',     row: 'bg-gray-50 dark:bg-gray-800/50 border-l-2 border-gray-400'        },
  yellow_card:      { icon: '🟨', label: 'Yellow Card',   row: 'bg-yellow-50 dark:bg-yellow-900/20 border-l-2 border-yellow-400'  },
  red_card:         { icon: '🟥', label: 'Red Card',      row: 'bg-red-50 dark:bg-red-900/20 border-l-2 border-red-400'           },
  substitution_in:  { icon: '↑',  label: 'Sub In',        row: 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-400'        },
  substitution_out: { icon: '↓',  label: 'Sub Out',       row: 'bg-indigo-50 dark:bg-indigo-900/20 border-l-2 border-indigo-400'  },
};

// ── Quick action mini-form ─────────────────────────────────────────────────────
function ActionForm({ actionKey, homePlayers, awayPlayers, homeTeam, awayTeam, onSubmit, onCancel, isPending }) {
  const { register, handleSubmit } = useForm({ defaultValues: { minute: 1, event_type: actionKey } });
  const isCard = actionKey === 'yellow_card' || actionKey === 'red_card';
  const isSub  = actionKey === 'substitution_in';
  const meta   = QUICK_ACTIONS.find(a => a.key === actionKey) || {};

  return (
    <form onSubmit={handleSubmit(onSubmit)}
      className="mt-3 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 p-4 space-y-3 animate-fade-in"
    >
      <div className="flex items-center justify-between mb-1">
        <h4 className="font-bold text-sm flex items-center gap-2">
          <span>{meta.icon}</span> Add {meta.label}
        </h4>
        <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 text-lg leading-none">✕</button>
      </div>
      <input type="hidden" {...register('event_type')} value={actionKey} />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Minute</label>
          <input
            {...register('minute', { valueAsNumber: true })}
            type="number" min="1" max="120"
            className="input w-full text-sm font-bold"
          />
        </div>
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Team</label>
          <select {...register('team_id', { valueAsNumber: true })} className="input w-full text-sm">
            <option value={homeTeam.id}>{homeTeam.name}</option>
            <option value={awayTeam.id}>{awayTeam.name}</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-gray-500 mb-1 block">
          {isSub ? 'Player In' : 'Player'}
        </label>
        <select {...register('player_id', { valueAsNumber: true })} className="input w-full text-sm">
          <option value="">— Select player —</option>
          <optgroup label={homeTeam.name}>
            {homePlayers.map(p => (
              <option key={p.id} value={p.id}>
                #{p.jersey_number} {p.first_name} {p.last_name}
              </option>
            ))}
          </optgroup>
          <optgroup label={awayTeam.name}>
            {awayPlayers.map(p => (
              <option key={p.id} value={p.id}>
                #{p.jersey_number} {p.first_name} {p.last_name}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {isSub && (
        <div>
          <label className="text-xs font-semibold text-gray-500 mb-1 block">Player Out</label>
          <select {...register('player_out_id', { valueAsNumber: true })} className="input w-full text-sm">
            <option value="">— Select player —</option>
            <optgroup label={homeTeam.name}>
              {homePlayers.map(p => (
                <option key={p.id} value={p.id}>
                  #{p.jersey_number} {p.first_name} {p.last_name}
                </option>
              ))}
            </optgroup>
            <optgroup label={awayTeam.name}>
              {awayPlayers.map(p => (
                <option key={p.id} value={p.id}>
                  #{p.jersey_number} {p.first_name} {p.last_name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel}
          className="flex-1 px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={isPending}
          className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold text-white transition-colors flex items-center justify-center gap-1 ${meta.bg}`}>
          {isPending && <Spinner size="sm" />}
          Confirm {meta.label}
        </button>
      </div>
    </form>
  );
}

// ── Team stats row ─────────────────────────────────────────────────────────────
function TeamStatBadges({ events, teamId }) {
  const goals   = events.filter(e => e.team_id === teamId && ['goal','penalty_scored'].includes(e.event_type)).length;
  const yellows = events.filter(e => e.team_id === teamId && e.event_type === 'yellow_card').length;
  const reds    = events.filter(e => e.team_id === teamId && e.event_type === 'red_card').length;
  return (
    <div className="flex items-center gap-1.5 flex-wrap justify-center mt-1">
      {goals   > 0 && <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">⚽ {goals}</span>}
      {yellows > 0 && <span className="text-[10px] font-bold bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-1.5 py-0.5 rounded-full">🟨 {yellows}</span>}
      {reds    > 0 && <span className="text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded-full">🟥 {reds}</span>}
    </div>
  );
}

// ── Live scoring panel ─────────────────────────────────────────────────────────
function LivePanel({ match, onClose, onMatchEnded }) {
  const qc = useQueryClient();
  const [activeAction, setActiveAction] = useState(null);
  const { register: regMotm } = useForm();

  const { data: homePlayers = [] } = useQuery({
    queryKey: ['team-players', match.home_team_id],
    queryFn:  () => teamService.getPlayers(match.home_team_id),
  });
  const { data: awayPlayers = [] } = useQuery({
    queryKey: ['team-players', match.away_team_id],
    queryFn:  () => teamService.getPlayers(match.away_team_id),
  });
  const { data: matchData, isLoading: mdLoading } = useQuery({
    queryKey: ['match', String(match.id)],
    queryFn:  () => matchService.getById(match.id),
    refetchInterval: 8000,
  });

  const invalidate = () => {
    qc.invalidateQueries(['match', String(match.id)]);
    qc.invalidateQueries(['admin-matches']);
  };

  const startMut = useMutation({
    mutationFn: () => matchService.start(match.id),
    onSuccess: () => { invalidate(); toast.success('Match démarré !'); },
    onError:   (e) => toast.error(e?.response?.data?.message || 'Erreur'),
  });
  const endMut = useMutation({
    mutationFn: () => matchService.end(match.id, {}),
    onSuccess: async () => {
      invalidate();
      toast.success('Match terminé');
      // fetch final match data for share card
      try {
        const finalData = await matchService.getById(match.id);
        onMatchEnded?.(finalData.match || match, finalData.events || []);
      } catch {
        onMatchEnded?.(match, []);
      }
      onClose();
    },
    onError:   (e) => toast.error(e?.response?.data?.message || 'Erreur'),
  });
  const eventMut = useMutation({
    mutationFn: (vals) => matchService.addEvent(match.id, vals),
    onSuccess: () => { invalidate(); setActiveAction(null); toast.success('Événement ajouté ✓'); },
    onError:   (e) => toast.error(e?.response?.data?.message || 'Erreur'),
  });
  const delEventMut = useMutation({
    mutationFn: (eid) => matchService.deleteEvent(match.id, eid),
    onSuccess: () => { invalidate(); toast.success('Événement supprimé'); },
    onError:   () => toast.error('Erreur'),
  });
  const motmMut = useMutation({
    mutationFn: (pid) => matchService.setMotm(match.id, pid),
    onSuccess: () => { invalidate(); toast.success('MOTM défini ⭐'); },
    onError:   () => toast.error('Erreur'),
  });

  const m      = matchData?.match  || match;
  const events = matchData?.events || [];
  const isLive = m.status === 'live';
  const isDone = m.status === 'finished';
  const allPlayers = [...homePlayers, ...awayPlayers];

  const goalEvents = events.filter(e => ['goal','own_goal','penalty_scored','penalty_missed'].includes(e.event_type));
  const cardEvents = events.filter(e => ['yellow_card','red_card'].includes(e.event_type));
  const subEvents  = events.filter(e => ['substitution_in','substitution_out'].includes(e.event_type));

  return (
    <div className="space-y-4">
      {/* ── Scoreboard ── */}
      <div className={`relative rounded-2xl p-5 text-center ${isLive
        ? 'bg-gradient-to-br from-gray-900 via-red-950/30 to-gray-900 border border-red-700/40'
        : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
      }`}>
        {isLive && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 via-red-400 to-red-500 rounded-t-2xl" />}

        <div className="grid grid-cols-3 items-center gap-4">
          <div className="flex flex-col items-center gap-1">
            <img src={m.home_team_logo || `https://placehold.co/56x56/16a34a/ffffff?text=H`} alt=""
              className="w-14 h-14 rounded-2xl object-cover shadow-md" />
            <p className={`text-xs font-bold truncate w-28 text-center ${isLive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
              {m.home_team_name}
            </p>
            {mdLoading ? null : <TeamStatBadges events={events} teamId={m.home_team_id} />}
          </div>

          <div className="text-center">
            {(isLive || isDone) ? (
              <p className={`text-5xl font-black tabular-nums ${isLive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                {m.home_score}<span className="text-gray-400 mx-1">–</span>{m.away_score}
              </p>
            ) : (
              <p className="text-2xl font-bold text-gray-400">vs</p>
            )}
            <div className="mt-2">
              {isLive && (
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> LIVE
                </span>
              )}
              {isDone && (
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                  ✓ Terminé
                </span>
              )}
              {m.status === 'scheduled' && (
                <span className="text-xs text-blue-400 font-semibold">Programmé</span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-center gap-1">
            <img src={m.away_team_logo || `https://placehold.co/56x56/1e40af/ffffff?text=A`} alt=""
              className="w-14 h-14 rounded-2xl object-cover shadow-md" />
            <p className={`text-xs font-bold truncate w-28 text-center ${isLive ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
              {m.away_team_name}
            </p>
            {mdLoading ? null : <TeamStatBadges events={events} teamId={m.away_team_id} />}
          </div>
        </div>

        {(m.venue || m.referee_name) && (
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-400">
            {m.venue        && <span>📍 {m.venue}</span>}
            {m.referee_name && <span>🏁 {m.referee_name}</span>}
          </div>
        )}

        <div className="flex justify-center gap-2 mt-4 flex-wrap">
          {m.status === 'scheduled' && (
            <button onClick={() => startMut.mutate()} disabled={startMut.isPending}
              className="btn-primary text-sm flex items-center gap-1.5 px-5">
              {startMut.isPending && <Spinner size="sm" />}
              ▶ Démarrer le match
            </button>
          )}
          {isLive && (
            <button
              onClick={() => { if (confirm('Terminer ce match ? Cette action est irréversible.')) endMut.mutate(); }}
              disabled={endMut.isPending}
              className="bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-red-700 flex items-center gap-1.5 shadow-md transition-colors"
            >
              {endMut.isPending && <Spinner size="sm" />}
              ⏹ Terminer le match
            </button>
          )}
        </div>
      </div>

      {/* ── Quick actions (live only) ── */}
      {isLive && (
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Actions rapides</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {QUICK_ACTIONS.map(action => (
              <button
                key={action.key}
                onClick={() => setActiveAction(activeAction === action.key ? null : action.key)}
                className={`flex flex-col items-center gap-1 py-3 px-2 rounded-2xl text-white font-bold text-xs transition-all active:scale-95 shadow-md
                  ${action.bg} ${activeAction === action.key ? `ring-2 ${action.ring} scale-105` : ''}`}
              >
                <span className="text-xl">{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>

          {activeAction && (
            <ActionForm
              actionKey={activeAction}
              homePlayers={homePlayers}
              awayPlayers={awayPlayers}
              homeTeam={{ id: m.home_team_id, name: m.home_team_name }}
              awayTeam={{ id: m.away_team_id, name: m.away_team_name }}
              onSubmit={(vals) => eventMut.mutate({ ...vals, event_type: activeAction })}
              onCancel={() => setActiveAction(null)}
              isPending={eventMut.isPending}
            />
          )}
        </div>
      )}

      {/* ── MOTM (finished) ── */}
      {isDone && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4">
          <h3 className="font-bold text-sm text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-2">
            ⭐ Man of the Match
          </h3>
          <div className="flex items-center gap-3">
            {m.motm_photo && (
              <img src={m.motm_photo} alt="" className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400" />
            )}
            <select
              className="input flex-1 text-sm"
              defaultValue={m.man_of_match_id || ''}
              onChange={e => e.target.value && motmMut.mutate(e.target.value)}
            >
              <option value="">— Sélectionner MOTM —</option>
              <optgroup label={m.home_team_name}>
                {homePlayers.map(p => (
                  <option key={p.id} value={p.id}>#{p.jersey_number} {p.first_name} {p.last_name}</option>
                ))}
              </optgroup>
              <optgroup label={m.away_team_name}>
                {awayPlayers.map(p => (
                  <option key={p.id} value={p.id}>#{p.jersey_number} {p.first_name} {p.last_name}</option>
                ))}
              </optgroup>
            </select>
            {m.motm_name && <p className="text-sm font-bold text-amber-700 dark:text-amber-400 whitespace-nowrap">{m.motm_name}</p>}
          </div>
        </div>
      )}

      {/* ── Events timeline ── */}
      {events.length > 0 && (
        <div className="space-y-3">
          {goalEvents.length > 0 && (
            <EventGroup
              title="Buts" icon="⚽"
              events={goalEvents}
              canDelete={isLive || isDone}
              onDelete={delEventMut.mutate}
              isPending={delEventMut.isPending}
            />
          )}
          {cardEvents.length > 0 && (
            <EventGroup
              title="Cartons" icon="🟨"
              events={cardEvents}
              canDelete={isLive || isDone}
              onDelete={delEventMut.mutate}
              isPending={delEventMut.isPending}
            />
          )}
          {subEvents.length > 0 && (
            <EventGroup
              title="Remplacements" icon="↕"
              events={subEvents}
              canDelete={isLive}
              onDelete={delEventMut.mutate}
              isPending={delEventMut.isPending}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ── Event group ────────────────────────────────────────────────────────────────
function EventGroup({ title, icon, events, canDelete, onDelete, isPending }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
      <div className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <span>{icon}</span>
        <h3 className="font-bold text-xs uppercase tracking-widest text-gray-500">{title}</h3>
        <span className="ml-auto bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{events.length}</span>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {events.map(ev => {
          const meta = EVENT_META[ev.event_type] || { icon: '•', label: ev.event_type, row: '' };
          return (
            <div key={ev.id} className={`flex items-center gap-3 px-4 py-2.5 text-sm ${meta.row}`}>
              <span className="text-base w-6 text-center shrink-0">{meta.icon}</span>
              <span className="font-black text-gray-400 w-8 text-center tabular-nums shrink-0">{ev.minute}'</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">{ev.player_name}</p>
                <p className="text-xs text-gray-400">{meta.label}</p>
              </div>
              <span className="text-[10px] text-gray-400 shrink-0 hidden sm:block">{ev.team_name || ''}</span>
              {canDelete && (
                <button
                  onClick={() => {
                    if (confirm(`Supprimer cet événement (${meta.label} — ${ev.minute}' — ${ev.player_name}) ?`))
                      onDelete(ev.id);
                  }}
                  disabled={isPending}
                  className="text-gray-300 hover:text-red-500 dark:text-gray-600 dark:hover:text-red-400 disabled:opacity-40 transition-colors text-base leading-none shrink-0 p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Supprimer cet événement"
                >✕</button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Match list row ─────────────────────────────────────────────────────────────
function MatchRow({ m, onManage, onEdit, onQuickStart }) {
  const isLive  = m.status === 'live';
  const isDone  = m.status === 'finished';
  const isSched = m.status === 'scheduled';

  return (
    <div className={`flex items-center gap-3 px-4 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors group
      ${isLive ? 'border-l-4 border-red-500 bg-red-50/30 dark:bg-red-950/10' : ''}`}>

      {/* Teams + score */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <img src={m.home_team_logo || `https://placehold.co/28x28/16a34a/ffffff?text=H`} alt=""
            className="w-7 h-7 rounded-lg object-cover shrink-0" />
          <span className="font-semibold text-sm truncate max-w-[90px] text-gray-900 dark:text-white">{m.home_team_name}</span>

          {(isLive || isDone) ? (
            <span className={`font-black text-base tabular-nums mx-1 ${isLive ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
              {m.home_score} – {m.away_score}
            </span>
          ) : (
            <span className="text-gray-400 text-xs font-bold mx-1">vs</span>
          )}

          <span className="font-semibold text-sm truncate max-w-[90px] text-gray-900 dark:text-white">{m.away_team_name}</span>
          <img src={m.away_team_logo || `https://placehold.co/28x28/1e40af/ffffff?text=A`} alt=""
            className="w-7 h-7 rounded-lg object-cover shrink-0" />
        </div>

        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {m.scheduled_at && (
            <span className="text-xs text-gray-400">
              🕐 {new Date(m.scheduled_at).toLocaleString([], { weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
            </span>
          )}
          {m.referee_name && <span className="text-xs text-gray-400">🏁 {m.referee_name}</span>}
          {m.phase && (
            <span className="text-[10px] font-semibold bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full capitalize">
              {m.phase.replace(/_/g, ' ')}
            </span>
          )}
          {isDone && m.yellow_cards_total > 0 && (
            <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400">🟨 {m.yellow_cards_total}</span>
          )}
          {isDone && m.red_cards_total > 0 && (
            <span className="text-[10px] font-bold text-red-500">🟥 {m.red_cards_total}</span>
          )}
        </div>
      </div>

      {/* Right-side actions */}
      <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
        {isLive && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> LIVE
          </span>
        )}
        {isDone && <Badge variant="finished">Terminé</Badge>}
        {isSched && <Badge variant="scheduled">Programmé</Badge>}

        {/* Edit button — scheduled only */}
        {isSched && (
          <button
            onClick={() => onEdit(m)}
            className="text-xs px-2.5 py-1.5 rounded-xl font-bold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            title="Modifier date / arbitre"
          >
            ✏️
          </button>
        )}

        {/* Quick start — scheduled only */}
        {isSched && (
          <button
            onClick={() => onQuickStart(m)}
            className="text-xs px-3 py-1.5 rounded-xl font-bold bg-green-600 text-white hover:bg-green-700 transition-colors flex items-center gap-1"
            title="Démarrer le match"
          >
            ▶ Start
          </button>
        )}

        {/* Manage / view */}
        <button
          onClick={() => onManage(m)}
          className={`text-xs px-3 py-1.5 rounded-xl font-bold transition-colors
            ${isLive
              ? 'bg-red-500 text-white hover:bg-red-600 shadow-md'
              : isDone
                ? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                : 'bg-primary/10 text-primary hover:bg-primary/20'
            }`}
        >
          {isLive ? '🎮 Gérer' : isDone ? '👁 Voir' : '⚙️'}
        </button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function MatchesAdmin() {
  const { t } = useTranslation();
  const qc    = useQueryClient();
  const [tab, setTab]             = useState('all');
  const [liveMatch, setLiveMatch]       = useState(null);
  const [creating, setCreating]         = useState(false);
  const [editMatch, setEditMatch]       = useState(null);
  const [exportData, setExportData]     = useState(null); // { match, events }

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['admin-matches'],
    queryFn:  () => matchService.getAll(),
    refetchInterval: 15000,
  });
  const { data: teams = [] }    = useQuery({ queryKey: ['teams-all'],  queryFn: teamService.getAll });
  const { data: referees = [] } = useQuery({ queryKey: ['referees'],   queryFn: refereeService.getAll });

  const { register, handleSubmit, reset } = useForm();
  const { register: regEdit, handleSubmit: handleEdit, reset: resetEdit, setValue: setEditVal } = useForm();

  const createMut = useMutation({
    mutationFn: matchService.create,
    onSuccess:  () => { qc.invalidateQueries(['admin-matches']); setCreating(false); reset(); toast.success('Match créé ✓'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Erreur'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => matchService.update(id, data),
    onSuccess:  () => { qc.invalidateQueries(['admin-matches']); setEditMatch(null); toast.success('Match modifié ✓'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Erreur'),
  });

  const startMut = useMutation({
    mutationFn: (id) => matchService.start(id),
    onSuccess:  () => { qc.invalidateQueries(['admin-matches']); toast.success('Match démarré !'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Erreur'),
  });

  function openEdit(m) {
    setEditMatch(m);
    // Pre-fill form with current values
    const local = m.scheduled_at
      ? new Date(m.scheduled_at).toISOString().slice(0, 16)
      : '';
    setEditVal('scheduled_at', local);
    setEditVal('referee_id', m.referee_id || '');
    setEditVal('venue', m.venue || '');
  }

  function handleQuickStart(m) {
    if (confirm(`Démarrer "${m.home_team_name} vs ${m.away_team_name}" maintenant ?`)) {
      startMut.mutate(m.id);
    }
  }

  const TABS = [
    { key: 'all',       label: 'Tous',       count: matches.length },
    { key: 'live',      label: 'En direct',  count: matches.filter(m => m.status === 'live').length },
    { key: 'scheduled', label: 'Programmés', count: matches.filter(m => m.status === 'scheduled').length },
    { key: 'finished',  label: 'Terminés',   count: matches.filter(m => m.status === 'finished').length },
  ];

  const filtered = matches.filter(m => tab === 'all' || m.status === tab);
  const liveCount = matches.filter(m => m.status === 'live').length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
        ← Dashboard
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Gestion des matchs</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {matches.length} au total
            {liveCount > 0 && <span className="text-red-500 font-semibold ml-1">· {liveCount} en direct</span>}
          </p>
        </div>
        <button onClick={() => setCreating(true)} className="btn-primary flex items-center gap-1.5 text-sm px-4 py-2">
          + Nouveau match
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map(tb => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all
              ${tab === tb.key
                ? tb.key === 'live' ? 'bg-red-500 text-white shadow-md' : 'bg-primary text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-primary'
              }`}
          >
            {tb.key === 'live' && tb.count > 0 && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            {tb.label}
            {tb.count > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab === tb.key ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'}`}>
                {tb.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Match list */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-14 text-center">
          <p className="text-4xl mb-3">⚽</p>
          <p className="text-gray-400 font-semibold">Aucun match trouvé</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filtered.map(m => (
              <MatchRow
                key={m.id}
                m={m}
                onManage={setLiveMatch}
                onEdit={openEdit}
                onQuickStart={handleQuickStart}
              />
            ))}
          </div>
        </div>
      )}

      {/* Manage / Live modal */}
      <Modal
        isOpen={!!liveMatch}
        onClose={() => setLiveMatch(null)}
        title={liveMatch ? `${liveMatch.home_team_name} vs ${liveMatch.away_team_name}` : ''}
        size="lg"
      >
        {liveMatch && (
          <LivePanel
            match={liveMatch}
            onClose={() => setLiveMatch(null)}
            onMatchEnded={(m, evs) => setExportData({ match: m, events: evs })}
          />
        )}
      </Modal>

      {/* Edit match modal */}
      <Modal
        isOpen={!!editMatch}
        onClose={() => { setEditMatch(null); resetEdit(); }}
        title={editMatch ? `Modifier — ${editMatch.home_team_name} vs ${editMatch.away_team_name}` : ''}
      >
        {editMatch && (
          <form
            onSubmit={handleEdit(v => updateMut.mutate({ id: editMatch.id, data: v }))}
            className="space-y-4"
          >
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Date &amp; Heure</label>
              <input
                {...regEdit('scheduled_at')}
                type="datetime-local"
                className="input w-full"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Arbitre</label>
              <select {...regEdit('referee_id', { valueAsNumber: true })} className="input w-full">
                <option value="">Aucun</option>
                {referees.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Stade / Lieu</label>
              <input {...regEdit('venue')} className="input w-full" placeholder="Nom du terrain" />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => { setEditMatch(null); resetEdit(); }} className="btn-secondary">
                Annuler
              </button>
              <button type="submit" disabled={updateMut.isPending} className="btn-primary flex items-center gap-1.5">
                {updateMut.isPending && <Spinner size="sm" />} Enregistrer
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Create match modal */}
      <Modal isOpen={creating} onClose={() => { setCreating(false); reset(); }} title="Créer un match">
        <form onSubmit={handleSubmit(v => createMut.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Équipe domicile</label>
              <select {...register('home_team_id', { required: true, valueAsNumber: true })} className="input w-full">
                <option value="">Sélectionner...</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Équipe extérieur</label>
              <select {...register('away_team_id', { required: true, valueAsNumber: true })} className="input w-full">
                <option value="">Sélectionner...</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Date &amp; Heure</label>
            <input {...register('scheduled_at')} type="datetime-local" className="input w-full" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Arbitre</label>
              <select {...register('referee_id', { valueAsNumber: true })} className="input w-full">
                <option value="">Aucun</option>
                {referees.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 mb-1 block">Stade / Lieu</label>
              <input {...register('venue')} className="input w-full" placeholder="Nom du terrain" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500 mb-1 block">Phase</label>
            <select {...register('phase')} className="input w-full">
              <option value="group">Phase de groupes</option>
              <option value="round_of_16">Huitièmes de finale</option>
              <option value="quarter_final">Quarts de finale</option>
              <option value="semi_final">Demi-finales</option>
              <option value="final">Finale</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={() => { setCreating(false); reset(); }} className="btn-secondary">Annuler</button>
            <button type="submit" disabled={createMut.isPending} className="btn-primary flex items-center gap-1.5">
              {createMut.isPending && <Spinner size="sm" />} Créer
            </button>
          </div>
        </form>
      </Modal>

      {/* Share card modal — auto-opens when match ends */}
      <ShareCardModal
        isOpen={!!exportData}
        onClose={() => setExportData(null)}
        title="Carte de résultat"
        filename={exportData ? `match-${exportData.match.home_team_name}-vs-${exportData.match.away_team_name}.png`.replace(/\s+/g, '-') : 'match-result.png'}
      >
        {exportData && (
          <MatchResultCard match={exportData.match} events={exportData.events} />
        )}
      </ShareCardModal>
    </div>
  );
}
