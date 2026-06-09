import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/tournament.service';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

export default function PlayersAdmin() {
  const { t }  = useTranslation();
  const qc     = useQueryClient();
  const [search, setSearch]     = useState('');
  const [finePlayer, setFinePlayer] = useState(null);

  const { data: players = [], isLoading } = useQuery({
    queryKey: ['admin-players'],
    queryFn:  () => adminService.getAllPlayers({ search }),
    enabled:  true,
  });

  const validateMut = useMutation({
    mutationFn: adminService.validatePlayer,
    onSuccess:  () => { qc.invalidateQueries(['admin-players']); toast.success('Player validated'); },
    onError:    () => toast.error('Error'),
  });
  const suspendMut = useMutation({
    mutationFn: adminService.suspendPlayer,
    onSuccess:  () => { qc.invalidateQueries(['admin-players']); toast.success('Player suspended'); },
    onError:    () => toast.error('Error'),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const fineMut = useMutation({
    mutationFn: (vals) => adminService.addFine({ player_id: finePlayer.id, ...vals }),
    onSuccess:  () => { qc.invalidateQueries(['admin-players']); toast.success('Fine added'); setFinePlayer(null); reset(); },
    onError:    () => toast.error('Error'),
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link to="/admin" className="text-sm text-primary hover:underline mb-4 inline-block">← Dashboard</Link>
      <h1 className="font-display text-2xl font-bold mb-4">Players Management</h1>

      <div className="mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search player name..."
          className="input w-full max-w-xs"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-border-light dark:divide-border-dark">
            {players.filter(p =>
              !search || `${p.first_name} ${p.last_name}`.toLowerCase().includes(search.toLowerCase())
            ).map(p => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                <img
                  src={p.photo_path || `https://placehold.co/40x40/1e40af/ffffff?text=${encodeURIComponent((p.first_name || '?')[0])}`}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{p.first_name} {p.last_name}</p>
                  <p className="text-xs text-gray-500">{p.team_name} · #{p.jersey_number} · {p.position}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                  {p.goals > 0 && <span className="text-xs text-primary font-bold">⚽ {p.goals}</span>}
                  {p.yellow_cards > 0 && <span className="bg-yellow-400 text-black font-bold px-1.5 py-0.5 rounded text-[10px]">{p.yellow_cards}Y</span>}
                  {p.red_cards > 0 && <span className="bg-red-600 text-white font-bold px-1.5 py-0.5 rounded text-[10px]">{p.red_cards}R</span>}
                  <Badge variant={p.validation_status}>{p.validation_status}</Badge>

                  {p.validation_status === 'pending' && (
                    <button
                      onClick={() => validateMut.mutate(p.id)}
                      className="text-xs px-2 py-1 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
                    >
                      Validate
                    </button>
                  )}
                  {p.validation_status !== 'suspended' && (
                    <button
                      onClick={() => suspendMut.mutate(p.id)}
                      className="text-xs px-2 py-1 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700"
                    >
                      Suspend
                    </button>
                  )}
                  <button
                    onClick={() => setFinePlayer(p)}
                    className="text-xs px-2 py-1 bg-yellow-500 text-white rounded-lg font-semibold hover:bg-yellow-600"
                  >
                    Fine
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fine modal */}
      <Modal isOpen={!!finePlayer} onClose={() => { setFinePlayer(null); reset(); }} title={`Fine: ${finePlayer?.first_name} ${finePlayer?.last_name}`}>
        <form onSubmit={handleSubmit(v => fineMut.mutate(v))} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Amount (DZD)</label>
            <input {...register('amount', { required: true, valueAsNumber: true })} type="number" min="0" className="input w-full" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Reason</label>
            <input {...register('reason', { required: true })} className="input w-full" placeholder="Reason for fine" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => { setFinePlayer(null); reset(); }} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={fineMut.isPending} className="btn-primary">Apply Fine</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
