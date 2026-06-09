import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/tournament.service';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['registration', 'group_stage', 'knockout', 'finished'];

export default function TournamentAdmin() {
  const qc = useQueryClient();

  const { data: tournament, isLoading } = useQuery({
    queryKey: ['admin-tournament'],
    queryFn:  adminService.getTournament,
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    values: tournament ? {
      name:       tournament.name,
      description: tournament.description || '',
      status:     tournament.status,
      start_date: tournament.start_date?.split('T')[0] || '',
      end_date:   tournament.end_date?.split('T')[0]   || '',
      max_teams:  tournament.max_teams || 16,
    } : undefined,
  });

  const saveMut = useMutation({
    mutationFn: adminService.updateTournament,
    onSuccess:  () => { qc.invalidateQueries(['admin-tournament']); toast.success('Settings saved'); },
    onError:    () => toast.error('Failed to save'),
  });

  const knockoutMut = useMutation({
    mutationFn: adminService.generateKnockout,
    onSuccess:  (data) => {
      qc.invalidateQueries(['admin-tournament']);
      qc.invalidateQueries(['bracket']);
      toast.success(data.message || 'Knockout bracket generated!');
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Error generating knockout'),
  });

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/admin" className="text-sm text-primary hover:underline mb-4 inline-block">← Dashboard</Link>
      <h1 className="font-display text-2xl font-bold mb-6">Tournament Settings</h1>

      <div className="card p-6 mb-6">
        <form onSubmit={handleSubmit(v => saveMut.mutate(v))} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Tournament Name</label>
            <input {...register('name', { required: true })} className="input w-full" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Description</label>
            <textarea {...register('description')} rows={3} className="input w-full resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Start Date</label>
              <input {...register('start_date')} type="date" className="input w-full" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">End Date</label>
              <input {...register('end_date')} type="date" className="input w-full" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Status</label>
              <select {...register('status')} className="input w-full">
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s.replace('_', ' ')}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Max Teams</label>
              <input {...register('max_teams', { valueAsNumber: true })} type="number" min="4" max="64" className="input w-full" />
            </div>
          </div>

          <button
            type="submit"
            disabled={saveMut.isPending}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {saveMut.isPending && <Spinner size="sm" />}
            Save Settings
          </button>
        </form>
      </div>

      {/* Knockout generation */}
      <div className="card p-6">
        <h2 className="font-display font-bold text-lg mb-2">Knockout Phase</h2>
        <p className="text-sm text-gray-500 mb-4">
          Once the group stage is complete, generate the knockout bracket. This will create matches based on group standings (1st and 2nd of each group).
        </p>
        {tournament?.status === 'group_stage' ? (
          <button
            onClick={() => {
              if (confirm('Generate knockout bracket? This will create round-of-16 matches from group standings.')) {
                knockoutMut.mutate();
              }
            }}
            disabled={knockoutMut.isPending}
            className="btn-primary flex items-center gap-2"
          >
            {knockoutMut.isPending && <Spinner size="sm" />}
            Generate Knockout Bracket
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <Badge variant={tournament?.status}>{tournament?.status}</Badge>
            {tournament?.status !== 'registration' && (
              <span className="text-sm text-gray-500">
                {tournament?.status === 'knockout' ? 'Knockout phase is active.' : 'Tournament not in group stage.'}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
