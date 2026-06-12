import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { playerService } from '../services/tournament.service';
import Spinner from '../components/ui/Spinner';
import toast from 'react-hot-toast';
import { useRef, useState } from 'react';

const schema = z.object({
  first_name:    z.string().min(2),
  last_name:     z.string().min(2),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  position:      z.enum(['GK', 'DEF', 'MID', 'FWD']),
  jersey_number: z.coerce.number().int().min(1).max(99),
  phone:         z.string().optional(),
  bio:           z.string().max(500).optional(),
});

export default function InviteForm() {
  const { token }   = useParams();
  const { t }       = useTranslation();
  const navigate    = useNavigate();
  const photoRef    = useRef(null);
  const [photo, setPhoto]     = useState(null);
  const [preview, setPreview] = useState(null);

  const { data: player, isLoading, isError } = useQuery({
    queryKey: ['invite', token],
    queryFn:  () => playerService.getInvite(token),
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const submitMut = useMutation({
    mutationFn: (vals) => {
      const form = new FormData();
      Object.entries(vals).forEach(([k, v]) => v !== undefined && form.append(k, v));
      if (photo) form.append('photo', photo);
      return playerService.submitInvite(token, form);
    },
    onSuccess: () => {
      toast.success(t('invite_form.reg_complete'));
      navigate('/');
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Registration failed'),
  });

  function handlePhoto(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setPhoto(f);
    setPreview(URL.createObjectURL(f));
  }

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  if (isError || !player) return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <p className="text-4xl mb-4">🔗</p>
      <h1 className="font-display text-2xl font-bold mb-2">{t('invite_form.invalid_title')}</h1>
      <p className="text-gray-500">{t('invite_form.invalid_sub')}</p>
    </div>
  );

  if (player.first_name) return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <p className="text-4xl mb-4">✅</p>
      <h1 className="font-display text-2xl font-bold mb-2">{t('invite_form.done_title')}</h1>
      <p className="text-gray-500">{t('invite_form.done_sub')}</p>
    </div>
  );

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="card p-6">
        <h1 className="font-display text-2xl font-bold mb-1">{t('invite_form.reg_title')}</h1>
        <p className="text-sm text-gray-500 mb-6">
          {t('invite_form.invited_to')} <span className="font-semibold text-primary">{player.team_name}</span>. {t('invite_form.fill_details')}
        </p>

        {/* Photo upload */}
        <div className="flex flex-col items-center mb-4">
          <img
            src={preview || `https://placehold.co/80x80/1e40af/ffffff?text=?`}
            alt="Photo"
            className="w-20 h-20 rounded-full object-cover mb-2 ring-2 ring-primary/30"
          />
          <label className="cursor-pointer text-sm text-primary hover:underline font-semibold">
            📷 {t('invite_form.add_photo')}
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </label>
          <p className="text-xs text-gray-400 mt-1">{t('invite_form.photo_hint')}</p>
        </div>

        {/* Example photo */}
        <div className="mb-6 rounded-2xl border border-dashed border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10 p-4">
          <p className="text-xs font-bold text-blue-500 uppercase tracking-widest text-center mb-3">
            {t('invite_form.photo_example')}
          </p>
          <div className="flex flex-col items-center gap-1.5">
            <img
              src="/person2.jpeg"
              alt="Exemple photo joueur"
              className="w-20 h-20 rounded-full object-cover ring-2 ring-blue-300 dark:ring-blue-700 shadow-md"
            />
            <span className="text-[10px] text-blue-500 font-semibold">{t('invite_form.good_photo')}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit(d => submitMut.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">{t('player.first_name')}</label>
              <input {...register('first_name')} className="input w-full" />
              {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">{t('player.last_name')}</label>
              <input {...register('last_name')} className="input w-full" />
              {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">{t('player.dob')}</label>
            <input {...register('date_of_birth')} type="date" className="input w-full" />
            {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">{t('player.position')}</label>
              <select {...register('position')} className="input w-full">
                <option value="">{t('common.all')}...</option>
                <option value="GK">{t('player.positions.GK')}</option>
                <option value="DEF">{t('player.positions.DEF')}</option>
                <option value="MID">{t('player.positions.MID')}</option>
                <option value="FWD">{t('player.positions.FWD')}</option>
              </select>
              {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">{t('player.jersey')}</label>
              <input {...register('jersey_number')} type="number" min="1" max="99" className="input w-full" />
              {errors.jersey_number && <p className="text-red-500 text-xs mt-1">{errors.jersey_number.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">{t('player.phone')} <span className="text-gray-400 font-normal">({t('common.optional')})</span></label>
            <input {...register('phone')} type="tel" className="input w-full" />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">
              {t('player.experience')} / Bio <span className="text-gray-400 font-normal">({t('common.optional')})</span>
            </label>
            <textarea
              {...register('bio')}
              rows={3}
              maxLength={500}
              placeholder={t('invite_form.bio_placeholder')}
              className="input w-full resize-none text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">{t('invite_form.bio_hint')}</p>
            {/* Bio example */}
            <div className="mt-2 rounded-xl border border-dashed border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-900/10 p-2.5">
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-1.5">{t('invite_form.bio_example')}</p>
              <div className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed space-y-1" dir="rtl">
                <p>لعبت لفريق سريع لمطار صنف أشبال u17 موسم 2016/2017</p>
                <p className="text-gray-400">مشارك في عدة دورات كروية:</p>
                <p>🏆 فائز كقائد فريق لمطار بدورة بملعب المدينة المنورة بسيدي بلعباس</p>
                <p>🏆 فائز بدورة في بلدية لمطار 2025</p>
                <p>⚽ مشارك في عدة دورات في بلدية لمطار مع الوصول لنهائي 8 مرات منها 5 متتالية مع فريق نابولي لمطار</p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitMut.isPending}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {submitMut.isPending && <Spinner size="sm" />}
            {t('invite_form.complete')}
          </button>
        </form>
      </div>
    </div>
  );
}
