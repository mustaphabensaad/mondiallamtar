import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { sponsorService } from '../../services/tournament.service';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { imgUrl } from '../../utils/imageUrl';

const TIERS = [
  {
    value: 'gold',
    label: 'Or',
    icon: '🥇',
    badge:    'bg-gradient-to-r from-yellow-400 to-amber-400 text-yellow-900',
    headerBg: 'bg-gradient-to-r from-yellow-500/10 to-amber-400/5',
    border:   'border-yellow-300/60 dark:border-yellow-700/50',
    sectionBg:'bg-yellow-50/30 dark:bg-yellow-900/10',
    emptyBorder: 'border-yellow-300/40 dark:border-yellow-700/30',
    textColor:'text-yellow-700 dark:text-yellow-400',
    desc:     'Visibilité maximale — logo large, position en haut',
  },
  {
    value: 'silver',
    label: 'Argent',
    icon: '🥈',
    badge:    'bg-gradient-to-r from-slate-400 to-gray-400 text-white',
    headerBg: 'bg-gradient-to-r from-slate-300/10 to-gray-200/5',
    border:   'border-slate-300/60 dark:border-slate-600/50',
    sectionBg:'bg-slate-50/30 dark:bg-slate-800/10',
    emptyBorder: 'border-slate-300/40 dark:border-slate-600/30',
    textColor:'text-slate-600 dark:text-slate-400',
    desc:     'Bonne visibilité — logo moyen, position centrale',
  },
  {
    value: 'bronze',
    label: 'Bronze',
    icon: '🥉',
    badge:    'bg-gradient-to-r from-orange-400 to-amber-500 text-white',
    headerBg: 'bg-gradient-to-r from-orange-400/10 to-amber-300/5',
    border:   'border-orange-200/60 dark:border-orange-800/50',
    sectionBg:'bg-orange-50/20 dark:bg-orange-900/10',
    emptyBorder: 'border-orange-200/40 dark:border-orange-800/30',
    textColor:'text-orange-600 dark:text-orange-500',
    desc:     'Visibilité standard — logo compact, position basse',
  },
];

function TierBadge({ tier }) {
  const t = TIERS.find(x => x.value === tier) || TIERS[2];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-sm ${t.badge}`}>
      {t.icon} {t.label}
    </span>
  );
}

const EMPTY_FORM = { name: '', logo_path: '', website_url: '', tier: 'gold', display_order: 0, is_active: true };

function SponsorModal({ initial, onClose, onSave, loading }) {
  const [form, setForm] = useState(initial || EMPTY_FORM);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl border border-gray-100 dark:border-gray-800 animate-scale-in">

        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h3 className="font-black text-gray-900 dark:text-white">
              {initial?.id ? '✏️ Modifier le sponsor' : '+ Nouveau sponsor'}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {initial?.id ? 'Modifiez les informations ci-dessous' : 'Remplissez les informations du partenaire'}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 text-sm transition-colors">
            ✕
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Nom du sponsor *
            </label>
            <input
              value={form.name}
              onChange={e => set('name', e.target.value)}
              placeholder="Ex: Mobilis"
              className="input"
            />
          </div>

          {/* Tier picker */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
              Niveau de partenariat
            </label>
            <div className="grid grid-cols-3 gap-2">
              {TIERS.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => set('tier', t.value)}
                  className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-bold transition-all duration-150
                    ${form.tier === t.value
                      ? 'border-primary bg-primary/8 text-primary shadow-sm scale-[1.02]'
                      : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                >
                  <span className="text-2xl leading-none">{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
            {form.tier && (
              <p className="text-[11px] text-gray-400 mt-2 text-center">
                {TIERS.find(t => t.value === form.tier)?.desc}
              </p>
            )}
          </div>

          {/* Logo URL */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              URL du logo
            </label>
            <input
              value={form.logo_path}
              onChange={e => set('logo_path', e.target.value)}
              placeholder="https://example.com/logo.png"
              className="input"
            />
            {form.logo_path && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center h-16 border border-gray-200 dark:border-gray-700">
                <img
                  src={imgUrl(form.logo_path) || form.logo_path}
                  alt="preview"
                  className="max-h-10 max-w-full object-contain"
                  onError={e => e.target.style.display = 'none'}
                />
              </div>
            )}
          </div>

          {/* Website */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Site web
            </label>
            <input
              value={form.website_url}
              onChange={e => set('website_url', e.target.value)}
              placeholder="https://sponsor.com"
              className="input"
            />
          </div>

          {/* Order + Active toggle */}
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                Ordre d'affichage
              </label>
              <input
                type="number" min="0"
                value={form.display_order}
                onChange={e => set('display_order', Number(e.target.value))}
                className="input"
              />
            </div>
            <div className="pb-0.5">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <button
                  type="button"
                  onClick={() => set('is_active', !form.is_active)}
                  className={`w-11 h-6 rounded-full transition-colors duration-200 relative flex-shrink-0
                    ${form.is_active ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200
                    ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {form.is_active ? 'Actif' : 'Inactif'}
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="px-6 pb-5 flex gap-3 border-t border-gray-100 dark:border-gray-800 pt-4">
          <Button className="flex-1" loading={loading} onClick={() => onSave(form)} disabled={!form.name.trim()}>
            {initial?.id ? '💾 Enregistrer' : '+ Ajouter'}
          </Button>
          <Button className="flex-1" variant="ghost" onClick={onClose}>Annuler</Button>
        </div>
      </div>
    </div>
  );
}

export default function SponsorsAdmin() {
  const qc = useQueryClient();
  const [modal, setModal]    = useState(null);
  const [delConfirm, setDel] = useState(null);

  const { data: sponsors = [], isLoading } = useQuery({
    queryKey: ['sponsors-admin'],
    queryFn:  sponsorService.getAll,
  });

  const create = useMutation({
    mutationFn: sponsorService.create,
    onSuccess: () => { toast.success('Sponsor ajouté ✓'); qc.invalidateQueries(['sponsors-admin']); qc.invalidateQueries(['sponsors']); setModal(null); },
    onError:   () => toast.error('Erreur lors de l\'ajout'),
  });

  const update = useMutation({
    mutationFn: ({ id, ...data }) => sponsorService.update(id, data),
    onSuccess: () => { toast.success('Sponsor mis à jour ✓'); qc.invalidateQueries(['sponsors-admin']); qc.invalidateQueries(['sponsors']); setModal(null); },
    onError:   () => toast.error('Erreur lors de la modification'),
  });

  const remove = useMutation({
    mutationFn: sponsorService.remove,
    onSuccess: () => { toast.success('Sponsor supprimé'); qc.invalidateQueries(['sponsors-admin']); qc.invalidateQueries(['sponsors']); setDel(null); },
    onError:   () => toast.error('Erreur lors de la suppression'),
  });

  const toggleActive = (s) => update.mutate({ id: s.id, is_active: !s.is_active });
  const handleSave   = (form) => modal?.id ? update.mutate({ id: modal.id, ...form }) : create.mutate(form);

  // Group by tier
  const byTier = { gold: [], silver: [], bronze: [] };
  sponsors.forEach(s => { (byTier[s.tier] || byTier.bronze).push(s); });

  const activeCount = sponsors.filter(s => s.is_active).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <Link to="/admin" className="text-xs text-gray-400 hover:text-primary transition-colors font-medium flex items-center gap-1 mb-2">
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-2">
            🤝 Sponsors
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {sponsors.length} partenaire{sponsors.length !== 1 ? 's' : ''} ·{' '}
            <span className="text-primary font-semibold">{activeCount} actif{activeCount !== 1 ? 's' : ''}</span>
          </p>
        </div>
        <button
          onClick={() => setModal('add')}
          className="btn-primary flex items-center gap-2"
        >
          <span className="text-base">+</span> Ajouter
        </button>
      </div>

      {/* ── Stats bar ── */}
      {!isLoading && sponsors.length > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-8">
          {TIERS.map(tier => {
            const count = byTier[tier.value].length;
            return (
              <div key={tier.value}
                className={`rounded-xl border ${tier.border} ${tier.headerBg} px-4 py-3 flex items-center gap-3`}>
                <span className="text-2xl">{tier.icon}</span>
                <div>
                  <p className={`text-xl font-black leading-none ${tier.textColor}`}>{count}</p>
                  <p className="text-xs text-gray-500 font-medium">{tier.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : sponsors.length === 0 ? (
        <div className="card overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-yellow-400 via-slate-400 to-orange-400" />
          <div className="flex flex-col items-center gap-4 py-16 text-center px-6">
            <div className="flex items-center gap-2 text-4xl">🥇🥈🥉</div>
            <div>
              <p className="font-black text-xl text-gray-900 dark:text-white">Aucun sponsor</p>
              <p className="text-gray-400 text-sm mt-1">Ajoutez vos premiers partenaires pour les afficher sur le site.</p>
            </div>
            <button onClick={() => setModal('add')} className="btn-primary mt-2 flex items-center gap-2">
              <span>+</span> Ajouter le premier sponsor
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {TIERS.map(tier => {
            const list = byTier[tier.value];
            return (
              <div key={tier.value} className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">

                {/* Tier header */}
                <div className={`flex items-center gap-3 px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 ${tier.headerBg}`}>
                  <span className="text-2xl">{tier.icon}</span>
                  <div className="flex-1">
                    <h2 className={`font-black ${tier.textColor}`}>Sponsors {tier.label}</h2>
                    <p className="text-[11px] text-gray-400">{tier.desc}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${tier.badge}`}>
                    {list.length} sponsor{list.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Sponsor list or empty */}
                {list.length === 0 ? (
                  <div className={`flex items-center gap-3 px-5 py-4 border-2 border-dashed ${tier.emptyBorder} m-3 rounded-xl`}>
                    <span className="text-xl opacity-40">{tier.icon}</span>
                    <p className="text-sm text-gray-400 flex-1">Aucun sponsor {tier.label.toLowerCase()} — </p>
                    <button
                      onClick={() => setModal({ ...EMPTY_FORM, tier: tier.value })}
                      className="text-xs text-primary font-semibold hover:underline"
                    >
                      + Ajouter
                    </button>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50 dark:divide-gray-800 bg-white dark:bg-[#111827]">
                    {list.map(s => (
                      <div key={s.id}
                        className={`flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors
                          ${!s.is_active ? 'opacity-50' : ''}`}>

                        {/* Logo preview */}
                        <div className="w-20 h-11 shrink-0 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-1.5 overflow-hidden">
                          <img
                            src={imgUrl(s.logo_path) || `https://placehold.co/80x32/e5e7eb/6b7280?text=${encodeURIComponent((s.name || '?')[0])}`}
                            alt={s.name}
                            className="max-w-full max-h-full object-contain"
                            onError={e => { e.target.src = `https://placehold.co/80x32/f3f4f6/9ca3af?text=${encodeURIComponent((s.name||'?')[0])}`; }}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-gray-900 dark:text-white truncate">{s.name}</p>
                            <TierBadge tier={s.tier} />
                            {!s.is_active && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-500 font-semibold">
                                Inactif
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                            {s.website_url && (
                              <a href={s.website_url} target="_blank" rel="noopener noreferrer"
                                className="text-xs text-primary hover:underline truncate max-w-[160px]">
                                {s.website_url.replace(/^https?:\/\/(www\.)?/, '')}
                              </a>
                            )}
                            <span className="text-xs text-gray-400">Ordre: {s.display_order}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => toggleActive(s)}
                            title={s.is_active ? 'Désactiver' : 'Activer'}
                            className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm transition-colors
                              ${s.is_active
                                ? 'border-green-200 dark:border-green-800 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                                : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                              }`}
                          >
                            {s.is_active ? '👁' : '🚫'}
                          </button>
                          <button
                            onClick={() => setModal(s)}
                            className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-center text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => setDel(s)}
                            className="w-8 h-8 rounded-lg border border-red-200 dark:border-red-900/60 flex items-center justify-center text-sm text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            🗑
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add/Edit modal ── */}
      {modal && (
        <SponsorModal
          initial={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          loading={create.isPending || update.isPending}
        />
      )}

      {/* ── Delete confirm ── */}
      {delConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-gray-800 text-center animate-scale-in">
            <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4 text-2xl">
              🗑
            </div>
            <h3 className="font-black text-gray-900 dark:text-white mb-1">Supprimer ce sponsor ?</h3>
            <p className="text-gray-500 text-sm mb-6">
              <strong className="text-gray-700 dark:text-gray-300">{delConfirm.name}</strong> sera définitivement supprimé et retiré du site.
            </p>
            <div className="flex gap-3">
              <Button className="flex-1" variant="danger" loading={remove.isPending}
                onClick={() => remove.mutate(delConfirm.id)}>
                Supprimer
              </Button>
              <Button className="flex-1" variant="ghost" onClick={() => setDel(null)}>Annuler</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
