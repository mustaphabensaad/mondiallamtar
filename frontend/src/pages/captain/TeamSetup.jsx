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

const schema = z.object({
  name:       z.string().min(2, 'Team name is required'),
  coach_name: z.string().min(2, 'Coach name is required'),
});

export default function TeamSetup() {
  const { t } = useTranslation();
  const qc    = useQueryClient();
  const [logoFile, setLogoFile] = useState(null);
  const [preview, setPreview]   = useState(null);

  const { data: myTeam, isLoading } = useQuery({
    queryKey: ['my-team'],
    queryFn:  teamService.getMyTeam,
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    values:   myTeam?.team ? { name: myTeam.team.name, coach_name: myTeam.team.coach_name } : undefined,
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
      toast.success('Team saved!');
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to save'),
  });

  function handleLogo(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setPreview(URL.createObjectURL(file));
  }

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  const team = myTeam?.team;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Link to="/captain/dashboard" className="text-sm text-primary hover:underline mb-4 inline-block">← {t('nav.dashboard')}</Link>
      <div className="card p-6">
        <h1 className="font-display text-2xl font-bold mb-6">{team ? 'Edit Team' : 'Create Your Team'}</h1>

        {/* Logo preview */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={preview || team?.logo_path || `https://placehold.co/96x96/16a34a/ffffff?text=${encodeURIComponent((team?.name || 'T')[0])}`}
            alt="Logo"
            className="w-24 h-24 rounded-2xl object-cover mb-3 ring-2 ring-primary/30"
          />
          <label className="cursor-pointer text-sm text-primary hover:underline">
            Upload Logo
            <input type="file" accept="image/*" className="hidden" onChange={handleLogo} />
          </label>
        </div>

        <form onSubmit={handleSubmit(d => saveMut.mutate(d))} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Team Name</label>
            <input {...register('name')} className="input w-full" placeholder="e.g. FC Alger Stars" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Coach Name</label>
            <input {...register('coach_name')} className="input w-full" placeholder="Coach full name" />
            {errors.coach_name && <p className="text-red-500 text-xs mt-1">{errors.coach_name.message}</p>}
          </div>

          {team && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 text-sm">
              <p className="text-gray-500">Status: <span className="font-semibold capitalize">{team.status}</span></p>
              {team.group_letter && <p className="text-gray-500 mt-1">Group: <span className="font-semibold text-primary">{team.group_letter}</span></p>}
            </div>
          )}

          <button
            type="submit"
            disabled={saveMut.isPending}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {saveMut.isPending && <Spinner size="sm" />}
            {team ? 'Save Changes' : 'Create Team'}
          </button>
        </form>
      </div>
    </div>
  );
}
