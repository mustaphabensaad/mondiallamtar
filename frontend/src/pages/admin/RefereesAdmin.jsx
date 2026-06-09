import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { refereeService } from '../../services/tournament.service';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

export default function RefereesAdmin() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null); // null=closed, false=new, obj=edit

  const { data: referees = [], isLoading } = useQuery({
    queryKey: ['referees'],
    queryFn:  refereeService.getAll,
  });

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm();

  function openNew() { reset(); setEditing(false); }
  function openEdit(r) {
    setValue('name', r.name);
    setValue('phone', r.phone || '');
    setEditing(r);
  }

  const saveMut = useMutation({
    mutationFn: (vals) =>
      editing ? refereeService.update(editing.id, vals) : refereeService.create(vals),
    onSuccess: () => {
      qc.invalidateQueries(['referees']);
      toast.success(editing ? 'Referee updated' : 'Referee added');
      setEditing(null); reset();
    },
    onError: () => toast.error('Error saving referee'),
  });

  const removeMut = useMutation({
    mutationFn: refereeService.remove,
    onSuccess:  () => { qc.invalidateQueries(['referees']); toast.success('Referee removed'); },
    onError:    () => toast.error('Error'),
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/admin" className="text-sm text-primary hover:underline mb-4 inline-block">← Dashboard</Link>
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl font-bold">Referees</h1>
        <button onClick={openNew} className="btn-primary text-sm">+ Add Referee</button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : referees.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">No referees yet.</div>
      ) : (
        <div className="card overflow-hidden">
          <div className="divide-y divide-border-light dark:divide-border-dark">
            {referees.map(r => (
              <div key={r.id} className="flex items-center gap-3 px-4 py-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                  {(r.name || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{r.name}</p>
                  {r.phone && <p className="text-xs text-gray-500">{r.phone}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => openEdit(r)}
                    className="text-xs px-2 py-1 bg-secondary/80 text-white rounded-lg hover:bg-secondary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => removeMut.mutate(r.id)}
                    disabled={removeMut.isPending}
                    className="text-xs px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={editing !== null}
        onClose={() => { setEditing(null); reset(); }}
        title={editing ? 'Edit Referee' : 'Add Referee'}
      >
        <form onSubmit={handleSubmit(v => saveMut.mutate(v))} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1">Full Name</label>
            <input {...register('name', { required: true })} className="input w-full" />
            {errors.name && <p className="text-red-500 text-xs mt-1">Name is required</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Phone (optional)</label>
            <input {...register('phone')} type="tel" className="input w-full" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => { setEditing(null); reset(); }} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={saveMut.isPending} className="btn-primary">{editing ? 'Save' : 'Add'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
