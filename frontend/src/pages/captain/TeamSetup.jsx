import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { teamService } from '../../services/tournament.service';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';
import { useState } from 'react';
import TermsAcceptModal from '../../components/ui/TermsAcceptModal';
import { imgUrl } from '../../utils/imageUrl';

const schema = z.object({
  name:         z.string().min(2, 'Team name is required'),
  coach_name:   z.string().min(2, 'Coach name is required'),
  captain_name: z.string().min(2, 'Captain name is required'),
});

export default function TeamSetup() {
  const { t } = useTranslation();
  const qc    = useQueryClient();
  const [logoFile, setLogoFile]     = useState(null);
  const [preview, setPreview]       = useState(null);
  const [pendingData, setPendingData] = useState(null);
  const [showTerms, setShowTerms]   = useState(false);

  const { data: myTeam, isLoading } = useQuery({
    queryKey: ['my-team'],
    queryFn:  teamService.getMyTeam,
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    values:   myTeam?.team ? { name: myTeam.team.name, coach_name: myTeam.team.coach_name, captain_name: myTeam.team.captain_name } : undefined,
  });

  const saveMut = useMutation({
    mutationFn: async (vals) => {
      const form = new FormData();
      Object.entries(vals).forEach(([k, v]) => form.append(k, v));
      if (logoFile) form.append('logo', logoFile);
      if (myTeam?.team) {
        return teamService.update(myTeam.team.id, form);
      }
      return teamService.create(form);
    },
    onSuccess: () => {
      qc.invalidateQueries(['my-team']);
      toast.success(t('captain.team_saved'));
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to save'),
  });

  function handleFormSubmit(vals) {
    if (!myTeam?.team) {
      // First-time creation: show terms before submitting
      setPendingData(vals);
      setShowTerms(true);
    } else {
      saveMut.mutate(vals);
    }
  }

  function handleTermsAccept() {
    setShowTerms(false);
    if (pendingData) {
      saveMut.mutate(pendingData);
      setPendingData(null);
    }
  }

  function handleLogo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setPreview(URL.createObjectURL(file));
  }

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  const team = myTeam?.team;

  return (
    <>
    <TermsAcceptModal
      isOpen={showTerms}
      teamName={pendingData?.coach_name || ''}
      onAccept={handleTermsAccept}
      onClose={() => setShowTerms(false)}
    />
    <div className="max-w-xl mx-auto px-4 py-8">
      <Link to="/captain/dashboard" className="text-sm text-primary hover:underline mb-4 inline-block">← {t('nav.dashboard')}</Link>
      <div className="card p-6">
        <h1 className="font-display text-2xl font-bold mb-6">{team ? t('captain.edit_team') : t('captain.create_team_title')}</h1>

        {/* Logo preview */}
        <div className="flex flex-col items-center mb-4">
          <img
            src={preview || imgUrl(team?.logo_path) || `https://placehold.co/96x96/16a34a/ffffff?text=${encodeURIComponent((team?.name || 'T')[0])}`}
            alt="Logo"
            className="w-24 h-24 rounded-2xl object-cover mb-3 ring-2 ring-primary/30"
          />
          <label className="cursor-pointer text-sm text-primary hover:underline font-semibold">
            📁 {t('captain.choose_logo')}
            <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
          </label>
          <p className="text-xs text-gray-400 mt-1">{t('captain.logo_hint')}</p>
        </div>

        {/* Example logos */}
        <div className="mb-6 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-800/30 p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-3">
            💡 {t('captain.logo_examples')}
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <div className="relative">
                <img
                  src="/team1.jpeg"
                  alt="Algérie FAF"
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-green-300 dark:ring-green-800 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white dark:border-gray-900 flex items-center justify-center text-[9px] text-white font-black">✓</span>
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">المنتخب الجزائري</span>
            </div>
            <div className="w-px h-16 bg-gray-200 dark:bg-gray-700" />
            <div className="flex flex-col items-center gap-1.5">
              <div className="relative">
                <img
                  src="/team2.jpeg"
                  alt="Al Ahli FC"
                  className="w-20 h-20 rounded-2xl object-cover ring-2 ring-green-300 dark:ring-green-800 shadow-md"
                />
                <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-white dark:border-gray-900 flex items-center justify-center text-[9px] text-white font-black">✓</span>
              </div>
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">Al Ahli FC · نادي الاهلي · المنتخب الجزائري</span>
            </div>
          </div>
          <p className="text-[11px] text-gray-400 text-center mt-3 leading-relaxed">
            {t('captain.good_logo_text')}
          </p>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">{t('captain.team_name_label')}</label>
            <input {...register('name')} className="input w-full" placeholder={t('captain.team_placeholder')} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">{t('captain.coach_name_label')}</label>
            <input {...register('coach_name')} className="input w-full" placeholder={t('captain.coach_placeholder')} />
            {errors.coach_name && <p className="text-red-500 text-xs mt-1">{errors.coach_name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">{t('captain.captain_name_label')}</label>
            <input {...register('captain_name')} className="input w-full" placeholder={t('captain.captain_placeholder')} />
            {errors.captain_name && <p className="text-red-500 text-xs mt-1">{errors.captain_name.message}</p>}
          </div>

          {team && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-sm">
              <p className="text-gray-500">{t('captain.status_label')}: <span className="font-semibold capitalize">{t(`team.status.${team.status}`)}</span></p>
              {team.group_letter && <p className="text-gray-500 mt-1">{t('captain.group_label')}: <span className="font-semibold text-primary">{team.group_letter}</span></p>}
            </div>
          )}

          <button
            type="submit"
            disabled={saveMut.isPending}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {saveMut.isPending && <Spinner size="sm" />}
            {team ? t('captain.save_changes') : t('captain.create_team_title')}
          </button>
        </form>
      </div>
    </div>
    </>
  );
}
