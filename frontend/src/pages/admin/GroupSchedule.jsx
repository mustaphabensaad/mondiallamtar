import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { matchService, refereeService, tournamentService, groupService } from '../../services/tournament.service';
import Spinner from '../../components/ui/Spinner';
import Button from '../../components/ui/Button';

const GROUP_COLORS = {
  A: 'bg-blue-500',   B: 'bg-green-500',  C: 'bg-amber-500', D: 'bg-red-500',
  E: 'bg-purple-500', F: 'bg-teal-500',   G: 'bg-orange-500', H: 'bg-pink-500',
};

export default function GroupSchedule() {
  const qc = useQueryClient();
  const [saving,    setSaving]    = useState({});
  const [schedules, setSchedules] = useState({});

  const { data: matches = [], isLoading: matchesLoading } = useQuery({
    queryKey: ['group-matches-schedule'],
    queryFn:  () => matchService.getAll({ phase: 'group' }),
  });

  useEffect(() => {
    if (!matches.length) return;
    const init = {};
    matches.forEach(m => {
      init[m.id] = {
        scheduled_at: m.scheduled_at ? m.scheduled_at.slice(0, 16) : '',
        referee_id:   m.referee_id   ? String(m.referee_id)        : '',
      };
    });
    setSchedules(init);
  }, [matches]);

  const { data: referees = [] } = useQuery({
    queryKey: ['referees'],
    queryFn:  refereeService.getAll,
  });

  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn:  tournamentService.getGroups,
  });

  // Map group_id → letter
  const groupLetterMap = {};
  groups.forEach(g => { groupLetterMap[g.id] = g.letter; });

  // Bucket matches by group letter
  const byGroup = {};
  matches.forEach(m => {
    const letter = groupLetterMap[m.group_id] || '?';
    if (!byGroup[letter]) byGroup[letter] = [];
    byGroup[letter].push(m);
  });

  const scheduled  = matches.filter(m => m.scheduled_at && m.referee_id).length;
  const total      = matches.length;

  const handleChange = (matchId, field, value) => {
    setSchedules(prev => ({ ...prev, [matchId]: { ...(prev[matchId] || {}), [field]: value } }));
  };

  const handleSave = async (matchId) => {
    setSaving(prev => ({ ...prev, [matchId]: true }));
    try {
      const s = schedules[matchId] || {};
      await matchService.update(matchId, {
        scheduled_at: s.scheduled_at || null,
        referee_id:   s.referee_id   ? Number(s.referee_id) : null,
      });
      toast.success('Match mis à jour');
      qc.invalidateQueries(['group-matches-schedule']);
    } catch {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setSaving(prev => ({ ...prev, [matchId]: false }));
    }
  };

  const handleSaveAll = async (letter) => {
    const matchList = byGroup[letter] || [];
    for (const m of matchList) {
      await handleSave(m.id);
    }
  };

  const [generating, setGenerating] = useState(false);
  const handleGenerateSchedules = async () => {
    if (!confirm('Générer les matchs de groupes (rotation équitable : J1: 1v3,2v4 | J2: 1v4,2v3 | J3: 1v2,3v4) ?\nLes matchs déjà programmés non démarrés seront remplacés.')) return;
    setGenerating(true);
    try {
      const res = await groupService.generateSchedules();
      toast.success(`${res.created} matchs générés ✓`);
      qc.invalidateQueries(['group-matches-schedule']);
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Erreur lors de la génération');
    } finally {
      setGenerating(false);
    }
  };

  if (matchesLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link to="/admin/draw" className="text-gray-400 hover:text-primary text-sm">← Tirage</Link>
          </div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Programmer les matchs de groupes</h1>
          <p className="text-gray-500 text-sm mt-0.5">Définissez l'heure et l'arbitre — les équipes sont déjà fixées</p>
        </div>
        <div className="flex flex-col items-end gap-3">
          <button
            onClick={handleGenerateSchedules}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-bold shadow-md transition-colors"
          >
            {generating ? <Spinner size="sm" /> : '⚽'}
            Générer les matchs (rotation équitable)
          </button>
          <div className="text-right">
            <p className="text-2xl font-black text-gray-900 dark:text-white">{scheduled}/{total}</p>
            <p className="text-xs text-gray-500">matchs programmés</p>
            <div className="h-1.5 w-32 bg-gray-100 dark:bg-gray-800 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: total ? `${(scheduled / total) * 100}%` : '0%' }}
              />
            </div>
          </div>
        </div>
      </div>

      {Object.keys(byGroup).sort().map(letter => (
        <div key={letter} className="mb-8">
          {/* Group header */}
          <div className="flex items-center justify-between mb-1">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-t-xl text-white font-bold text-sm ${GROUP_COLORS[letter] || 'bg-gray-500'}`}>
              Groupe {letter}
              <span className="opacity-70 text-xs font-normal">
                ({byGroup[letter].filter(m => schedules[m.id]?.scheduled_at && schedules[m.id]?.referee_id).length}/{byGroup[letter].length} programmés)
              </span>
            </div>
            <button
              onClick={() => handleSaveAll(letter)}
              className="text-xs text-primary hover:underline font-semibold mr-1"
            >
              Tout enregistrer
            </button>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-b-xl rounded-tr-xl overflow-hidden bg-white dark:bg-[#111827]">
            {byGroup[letter].map((match, i) => {
              const s   = schedules[match.id] || {};
              const set = !!(s.scheduled_at && s.referee_id);

              return (
                <div
                  key={match.id}
                  className={`flex flex-wrap items-center gap-3 px-5 py-4
                    ${i > 0 ? 'border-t border-gray-100 dark:border-gray-800' : ''}
                    ${set ? 'bg-green-50/30 dark:bg-green-900/10' : ''}`}
                >
                  {/* Match number */}
                  <span className="text-xs text-gray-400 font-mono w-5 shrink-0">#{match.match_number}</span>

                  {/* Teams */}
                  <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                    <img
                      src={match.home_logo || `https://placehold.co/32x32/16a34a/fff?text=${encodeURIComponent((match.home_team_name || 'H')[0])}`}
                      className="w-8 h-8 rounded-lg object-cover shrink-0"
                      alt=""
                    />
                    <span className="font-bold text-sm text-gray-900 dark:text-white">{match.home_team_name}</span>
                    <span className="text-gray-400 text-xs font-bold mx-1">vs</span>
                    <span className="font-bold text-sm text-gray-900 dark:text-white">{match.away_team_name}</span>
                    <img
                      src={match.away_logo || `https://placehold.co/32x32/16a34a/fff?text=${encodeURIComponent((match.away_team_name || 'A')[0])}`}
                      className="w-8 h-8 rounded-lg object-cover shrink-0"
                      alt=""
                    />
                  </div>

                  {/* Date/time */}
                  <input
                    type="datetime-local"
                    value={s.scheduled_at || ''}
                    onChange={e => handleChange(match.id, 'scheduled_at', e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
                               text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30
                               focus:border-primary shrink-0"
                  />

                  {/* Referee */}
                  <select
                    value={s.referee_id || ''}
                    onChange={e => handleChange(match.id, 'referee_id', e.target.value)}
                    className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800
                               text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30
                               focus:border-primary shrink-0"
                  >
                    <option value="">— Arbitre —</option>
                    {referees.map(r => (
                      <option key={r.id} value={r.id}>{r.name}</option>
                    ))}
                  </select>

                  {/* Save */}
                  <div className="flex items-center gap-2 shrink-0">
                    {set && <span className="text-green-600 dark:text-green-400 text-xs font-semibold">✓</span>}
                    <Button size="sm" loading={saving[match.id]} onClick={() => handleSave(match.id)}>
                      Enregistrer
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {Object.keys(byGroup).length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">⚽</p>
          <p className="text-gray-500 mb-4">Aucun match de groupe trouvé. Finalisez d'abord le tirage.</p>
          <Link to="/admin/draw" className="text-primary font-semibold hover:underline">
            Aller au tirage →
          </Link>
        </div>
      )}
    </div>
  );
}
