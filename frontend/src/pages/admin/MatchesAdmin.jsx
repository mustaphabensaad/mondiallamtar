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

const EVENT_TYPES = [
  { value: 'goal',             label: '⚽ Goal' },
  { value: 'own_goal',         label: '⚽ Own Goal' },
  { value: 'penalty_scored',   label: '⚽ Penalty Scored' },
  { value: 'penalty_missed',   label: '✗ Penalty Missed' },
  { value: 'yellow_card',      label: '🟨 Yellow Card' },
  { value: 'red_card',         label: '🟥 Red Card' },
  { value: 'substitution_in',  label: '↑ Substitution In' },
  { value: 'substitution_out', label: '↓ Substitution Out' },
];

// ── Sub-component: Live scoring panel for a match ─────────────────────────────
function LivePanel({ match, onClose }) {
  const qc = useQueryClient();
  const { register, handleSubmit, reset } = useForm({ defaultValues: { event_type: 'goal', minute: 1 } });

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
    refetchInterval: 10000,
  });

  const startMut = useMutation({
    mutationFn: () => matchService.start(match.id),
    onSuccess:  () => { qc.invalidateQueries(['match', String(match.id)]); qc.invalidateQueries(['admin-matches']); toast.success('Match started!'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Error'),
  });

  const endMut = useMutation({
    mutationFn: () => matchService.end(match.id, {}),
    onSuccess:  () => { qc.invalidateQueries(['match', String(match.id)]); qc.invalidateQueries(['admin-matches']); toast.success('Match ended'); onClose(); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Error'),
  });

  const eventMut = useMutation({
    mutationFn: (vals) => matchService.addEvent(match.id, vals),
    onSuccess:  () => { qc.invalidateQueries(['match', String(match.id)]); reset({ event_type: 'goal', minute: 1 }); toast.success('Event added'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Error'),
  });

  const delEventMut = useMutation({
    mutationFn: (eid) => matchService.deleteEvent(match.id, eid),
    onSuccess:  () => { qc.invalidateQueries(['match', String(match.id)]); toast.success('Event removed'); },
    onError:    () => toast.error('Error'),
  });

  const motmMut = useMutation({
    mutationFn: (pid) => matchService.setMotm(match.id, pid),
    onSuccess:  () => { qc.invalidateQueries(['match', String(match.id)]); toast.success('MOTM set'); },
    onError:    () => toast.error('Error'),
  });

  const m       = matchData?.match || match;
  const events  = matchData?.events || [];
  const isLive  = m.status === 'live';
  const isDone  = m.status === 'finished';
  const allPlayers = [...homePlayers, ...awayPlayers];

  return (
    <div className="space-y-5">
      {/* Scoreboard */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 text-center">
        <div className="flex items-center justify-around gap-2">
          <div className="flex flex-col items-center gap-1 flex-1">
            <img src={m.home_team_logo || `https://placehold.co/48x48/16a34a/ffffff?text=H`} alt="" className="w-12 h-12 rounded-xl object-cover" />
            <p className="text-xs font-bold truncate w-24 text-center">{m.home_team_name}</p>
          </div>
          <div>
            {(isLive || isDone) ? (
              <p className="text-4xl font-black tabular-nums">{m.home_score} – {m.away_score}</p>
            ) : (
              <p className="text-xl font-bold text-gray-400">vs</p>
            )}
            <Badge variant={m.status} className="block text-center mt-1">{m.status}</Badge>
          </div>
          <div className="flex flex-col items-center gap-1 flex-1">
            <img src={m.away_team_logo || `https://placehold.co/48x48/1e40af/ffffff?text=A`} alt="" className="w-12 h-12 rounded-xl object-cover" />
            <p className="text-xs font-bold truncate w-24 text-center">{m.away_team_name}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex justify-center gap-2 mt-3 flex-wrap">
          {m.status === 'scheduled' && (
            <button onClick={() => startMut.mutate()} disabled={startMut.isPending} className="btn-primary text-sm flex items-center gap-1">
              {startMut.isPending && <Spinner size="sm" />} Start Match
            </button>
          )}
          {isLive && (
            <button
              onClick={() => { if (confirm('End this match?')) endMut.mutate(); }}
              disabled={endMut.isPending}
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 flex items-center gap-1"
            >
              {endMut.isPending && <Spinner size="sm" />} End Match
            </button>
          )}
          {isDone && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold">MOTM:</label>
              <select
                className="input text-xs"
                defaultValue={m.man_of_match_id || ''}
                onChange={e => e.target.value && motmMut.mutate(e.target.value)}
              >
                <option value="">Select player...</option>
                {allPlayers.map(p => (
                  <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Add event */}
      {isLive && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
          <h3 className="font-bold text-sm mb-3">Add Event</h3>
          <form onSubmit={handleSubmit(v => eventMut.mutate(v))} className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-gray-500 mb-0.5 block">Event Type</label>
              <select {...register('event_type')} className="input w-full text-sm">
                {EVENT_TYPES.map(et => <option key={et.value} value={et.value}>{et.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-0.5 block">Minute</label>
              <input {...register('minute', { valueAsNumber: true })} type="number" min="1" max="120" className="input w-full text-sm" />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-0.5 block">Player</label>
              <select {...register('player_id', { valueAsNumber: true })} className="input w-full text-sm">
                <option value="">Select player...</option>
                <optgroup label={m.home_team_name}>
                  {homePlayers.map(p => <option key={p.id} value={p.id}>#{p.jersey_number} {p.first_name} {p.last_name}</option>)}
                </optgroup>
                <optgroup label={m.away_team_name}>
                  {awayPlayers.map(p => <option key={p.id} value={p.id}>#{p.jersey_number} {p.first_name} {p.last_name}</option>)}
                </optgroup>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-0.5 block">Team</label>
              <select {...register('team_id', { valueAsNumber: true })} className="input w-full text-sm">
                <option value={m.home_team_id}>{m.home_team_name}</option>
                <option value={m.away_team_id}>{m.away_team_name}</option>
              </select>
            </div>
            <div className="col-span-2">
              <button type="submit" disabled={eventMut.isPending} className="btn-primary w-full text-sm flex items-center justify-center gap-1">
                {eventMut.isPending && <Spinner size="sm" />} Add Event
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Events list */}
      {events.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl overflow-hidden">
          <h3 className="font-bold text-sm px-3 py-2 border-b border-border-light dark:border-border-dark">Events</h3>
          <div className="divide-y divide-border-light dark:divide-border-dark max-h-48 overflow-y-auto">
            {events.map(ev => (
              <div key={ev.id} className="flex items-center gap-2 px-3 py-2 text-xs">
                <span className="w-6 text-center">{ev.event_type === 'goal' || ev.event_type === 'penalty_scored' ? '⚽' : ev.event_type === 'yellow_card' ? '🟨' : ev.event_type === 'red_card' ? '🟥' : '•'}</span>
                <span className="font-bold text-gray-400 w-8">{ev.minute}'</span>
                <span className="flex-1 font-semibold">{ev.player_name}</span>
                <span className="text-gray-400 capitalize">{ev.event_type.replace(/_/g, ' ')}</span>
                {isLive && (
                  <button onClick={() => delEventMut.mutate(ev.id)} className="text-red-400 hover:text-red-600 ml-1">✕</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function MatchesAdmin() {
  const { t } = useTranslation();
  const qc    = useQueryClient();
  const [tab, setTab]         = useState('all');
  const [liveMatch, setLiveMatch] = useState(null);
  const [creating, setCreating]   = useState(false);

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['admin-matches'],
    queryFn:  () => matchService.getAll(),
    refetchInterval: 15000,
  });

  const { data: teams = [] } = useQuery({
    queryKey: ['teams-all'],
    queryFn:  teamService.getAll,
  });

  const { data: referees = [] } = useQuery({
    queryKey: ['referees'],
    queryFn:  refereeService.getAll,
  });

  const { register, handleSubmit, reset } = useForm();
  const createMut = useMutation({
    mutationFn: matchService.create,
    onSuccess:  () => { qc.invalidateQueries(['admin-matches']); setCreating(false); reset(); toast.success('Match created'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Error'),
  });

  const TABS = [
    { key: 'all',       label: 'All' },
    { key: 'live',      label: 'Live' },
    { key: 'scheduled', label: 'Scheduled' },
    { key: 'finished',  label: 'Finished' },
  ];

  const filtered = matches.filter(m => tab === 'all' || m.status === tab);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/admin" className="text-sm text-primary hover:underline mb-4 inline-block">← Dashboard</Link>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl font-bold">Matches Management</h1>
        <button onClick={() => setCreating(true)} className="btn-primary text-sm">+ New Match</button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map(tb => (
          <button
            key={tb.key}
            onClick={() => setTab(tb.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-colors ${tab === tb.key ? 'bg-primary text-white' : 'bg-gray-50 dark:bg-gray-800/50 text-gray-500 hover:text-primary'}`}
          >
            {tb.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No matches found</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-border-light dark:divide-border-dark">
            {filtered.map(m => (
              <div key={m.id} className="flex items-center gap-3 px-4 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <img src={m.home_team_logo || `https://placehold.co/28x28/16a34a/ffffff?text=H`} alt="" className="w-7 h-7 rounded object-cover" />
                    <span className="font-semibold text-sm truncate max-w-[100px]">{m.home_team_name}</span>
                    {(m.status === 'live' || m.status === 'finished') && (
                      <span className="font-black text-primary">{m.home_score} – {m.away_score}</span>
                    )}
                    {m.status === 'scheduled' && <span className="text-gray-400 text-sm">vs</span>}
                    <span className="font-semibold text-sm truncate max-w-[100px]">{m.away_team_name}</span>
                    <img src={m.away_team_logo || `https://placehold.co/28x28/1e40af/ffffff?text=A`} alt="" className="w-7 h-7 rounded object-cover" />
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {m.scheduled_at && new Date(m.scheduled_at).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    {m.phase && <span className="ml-2 capitalize">{m.phase.replace('_', ' ')}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant={m.status}>{m.status}</Badge>
                  {m.status !== 'finished' && (
                    <button
                      onClick={() => setLiveMatch(m)}
                      className="text-xs px-3 py-1.5 bg-primary text-white rounded-lg font-semibold hover:bg-primary/80"
                    >
                      {m.status === 'live' ? '🔴 Manage' : 'Manage'}
                    </button>
                  )}
                  {m.status === 'finished' && (
                    <button
                      onClick={() => setLiveMatch(m)}
                      className="text-xs px-3 py-1.5 bg-gray-200 dark:bg-gray-700 rounded-lg font-semibold"
                    >
                      View
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Live/Manage modal */}
      <Modal
        isOpen={!!liveMatch}
        onClose={() => setLiveMatch(null)}
        title={liveMatch ? `${liveMatch.home_team_name} vs ${liveMatch.away_team_name}` : ''}
      >
        {liveMatch && <LivePanel match={liveMatch} onClose={() => setLiveMatch(null)} />}
      </Modal>

      {/* Create match modal */}
      <Modal isOpen={creating} onClose={() => { setCreating(false); reset(); }} title="Create Match">
        <form onSubmit={handleSubmit(v => createMut.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1 block">Home Team</label>
              <select {...register('home_team_id', { required: true, valueAsNumber: true })} className="input w-full">
                <option value="">Select...</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">Away Team</label>
              <select {...register('away_team_id', { required: true, valueAsNumber: true })} className="input w-full">
                <option value="">Select...</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block">Date &amp; Time</label>
            <input {...register('scheduled_at')} type="datetime-local" className="input w-full" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold mb-1 block">Referee</label>
              <select {...register('referee_id', { valueAsNumber: true })} className="input w-full">
                <option value="">None</option>
                {referees.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">Venue</label>
              <input {...register('venue')} className="input w-full" placeholder="Stadium name" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold mb-1 block">Phase</label>
            <select {...register('phase')} className="input w-full">
              <option value="group">Group Stage</option>
              <option value="round_of_16">Round of 16</option>
              <option value="quarter_final">Quarter Final</option>
              <option value="semi_final">Semi Final</option>
              <option value="final">Final</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => { setCreating(false); reset(); }} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={createMut.isPending} className="btn-primary flex items-center gap-1">
              {createMut.isPending && <Spinner size="sm" />} Create
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
