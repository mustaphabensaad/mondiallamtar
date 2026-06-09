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
      toast.success('Registration complete! Welcome to the team.');
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
      <h1 className="font-display text-2xl font-bold mb-2">Invalid or Expired Link</h1>
      <p className="text-gray-500">This invite link is invalid or has already been used.</p>
    </div>
  );

  if (player.first_name) return (
    <div className="max-w-md mx-auto px-4 py-16 text-center">
      <p className="text-4xl mb-4">✅</p>
      <h1 className="font-display text-2xl font-bold mb-2">Already Registered</h1>
      <p className="text-gray-500">This invite has already been completed.</p>
    </div>
  );

  return (
    <div className="max-w-md mx-auto px-4 py-8">
      <div className="card p-6">
        <h1 className="font-display text-2xl font-bold mb-1">Player Registration</h1>
        <p className="text-sm text-gray-500 mb-6">
          You've been invited to join <span className="font-semibold text-primary">{player.team_name}</span>. Fill in your details below.
        </p>

        {/* Photo */}
        <div className="flex flex-col items-center mb-6">
          <img
            src={preview || `https://placehold.co/80x80/1e40af/ffffff?text=?`}
            alt="Photo"
            className="w-20 h-20 rounded-full object-cover mb-2 ring-2 ring-primary/30"
          />
          <label className="cursor-pointer text-sm text-primary hover:underline">
            Upload Photo (optional)
            <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
          </label>
        </div>

        <form onSubmit={handleSubmit(d => submitMut.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">First Name</label>
              <input {...register('first_name')} className="input w-full" />
              {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Last Name</label>
              <input {...register('last_name')} className="input w-full" />
              {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Date of Birth</label>
            <input {...register('date_of_birth')} type="date" className="input w-full" />
            {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold mb-1">Position</label>
              <select {...register('position')} className="input w-full">
                <option value="">Select...</option>
                <option value="GK">Goalkeeper</option>
                <option value="DEF">Defender</option>
                <option value="MID">Midfielder</option>
                <option value="FWD">Forward</option>
              </select>
              {errors.position && <p className="text-red-500 text-xs mt-1">{errors.position.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Jersey Number</label>
              <input {...register('jersey_number')} type="number" min="1" max="99" className="input w-full" />
              {errors.jersey_number && <p className="text-red-500 text-xs mt-1">{errors.jersey_number.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Phone (optional)</label>
            <input {...register('phone')} type="tel" className="input w-full" />
          </div>

          <button
            type="submit"
            disabled={submitMut.isPending}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {submitMut.isPending && <Spinner size="sm" />}
            Complete Registration
          </button>
        </form>
      </div>
    </div>
  );
}
