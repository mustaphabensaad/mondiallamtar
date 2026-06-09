import { useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { paymentService } from '../../services/tournament.service';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import toast from 'react-hot-toast';

const STATUS_INFO = {
  unpaid:          { label: 'Not Paid',         color: 'text-red-500',    bg: 'bg-red-50 dark:bg-red-900/20' },
  pending_review:  { label: 'Under Review',     color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/20' },
  paid:            { label: 'Confirmed',         color: 'text-green-600',  bg: 'bg-green-50 dark:bg-green-900/20' },
};

export default function Payment() {
  const { t } = useTranslation();
  const qc    = useQueryClient();
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const { data: payment, isLoading } = useQuery({
    queryKey: ['payment-status'],
    queryFn:  paymentService.getStatus,
  });

  const uploadMut = useMutation({
    mutationFn: () => {
      const form = new FormData();
      form.append('proof', file);
      return paymentService.uploadProof(form);
    },
    onSuccess: () => {
      qc.invalidateQueries(['payment-status']);
      setFile(null);
      setPreview(null);
      toast.success('Payment proof uploaded! Awaiting confirmation.');
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Upload failed'),
  });

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (f.type.startsWith('image/')) setPreview(URL.createObjectURL(f));
    else setPreview(null);
  }

  if (isLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;

  const status  = payment?.payment_status || 'unpaid';
  const info    = STATUS_INFO[status] || STATUS_INFO.unpaid;

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <Link to="/captain/dashboard" className="text-sm text-primary hover:underline mb-4 inline-block">← {t('nav.dashboard')}</Link>

      <h1 className="font-display text-2xl font-bold mb-6">Registration Payment</h1>

      {/* Status card */}
      <div className={`card p-6 mb-6 ${info.bg}`}>
        <div className="flex items-center gap-3">
          <div className={`text-4xl font-black ${info.color}`}>
            {status === 'paid' ? '✓' : status === 'pending_review' ? '⏳' : '!'}
          </div>
          <div>
            <p className="font-bold text-lg">{info.label}</p>
            <p className="text-sm text-gray-500">
              {status === 'unpaid' && 'Upload your payment proof to complete registration.'}
              {status === 'pending_review' && 'Your proof has been submitted. Admin will confirm shortly.'}
              {status === 'paid' && 'Your registration fee has been confirmed. Good luck!'}
            </p>
          </div>
        </div>
      </div>

      {/* Payment info */}
      {status !== 'paid' && (
        <div className="card p-5 mb-6">
          <h2 className="font-display font-bold mb-3 flex items-center gap-2">💳 Payment Instructions</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-border-light dark:border-border-dark pb-3">
              <span className="text-gray-500">Registration Fee</span>
              <span className="font-black text-primary text-lg">8 000 DZD</span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-xs leading-relaxed">
              Transfer the fee directly to one of the tournament organisers, then upload your proof of payment below.
            </p>
            <div className="space-y-2">
              {[
                { name: 'حماني أيوب', phone: '0670062056' },
                { name: 'عبادة محمد',  phone: '0665181513' },
              ].map(c => (
                <div key={c.phone} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 rounded-xl px-4 py-2.5">
                  <span className="font-semibold">{c.name}</span>
                  <a href={`tel:${c.phone}`} className="font-mono font-bold text-primary hover:underline">{c.phone}</a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Upload */}
      {status !== 'paid' && (
        <div className="card p-5">
          <h2 className="font-display font-bold mb-3">Upload Proof of Payment</h2>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-border-light dark:border-border-dark rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            {preview ? (
              <img src={preview} alt="Preview" className="max-h-48 mx-auto rounded-lg object-contain" />
            ) : (
              <>
                <p className="text-3xl mb-2">📎</p>
                <p className="text-sm text-gray-500">Click to select image or PDF</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, or PDF · max 5 MB</p>
              </>
            )}
            {file && !preview && <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">{file.name}</p>}
          </div>
          <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={handleFile} />

          {file && (
            <button
              onClick={() => uploadMut.mutate()}
              disabled={uploadMut.isPending}
              className="btn-primary w-full mt-4 flex items-center justify-center gap-2"
            >
              {uploadMut.isPending && <Spinner size="sm" />}
              Submit Payment Proof
            </button>
          )}
        </div>
      )}
    </div>
  );
}
