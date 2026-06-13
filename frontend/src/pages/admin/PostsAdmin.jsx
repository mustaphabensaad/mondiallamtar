import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { postService } from '../../services/tournament.service';
import Spinner from '../../components/ui/Spinner';

const EMPTY = { title: '', body: '', external_link: '', published: true };

function PostModal({ initial, onClose, onSave, loading }) {
  const [form, setForm]       = useState(initial || EMPTY);
  const [imgFile, setImgFile] = useState(null);
  const [preview, setPreview] = useState(initial?.image_path || null);
  const fileRef = useRef();
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const imgSrc = preview
    ? (preview.startsWith('blob') ? preview : `${import.meta.env.VITE_API_URL || ''}${preview}`)
    : null;

  function handleFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setImgFile(f);
    setPreview(URL.createObjectURL(f));
  }

  function handleSave() {
    if (!form.title.trim()) return toast.error('Le titre est requis');
    const fd = new FormData();
    fd.append('title',         form.title);
    fd.append('body',          form.body || '');
    fd.append('external_link', form.external_link || '');
    fd.append('published',     form.published ? '1' : '0');
    if (imgFile) fd.append('image', imgFile);
    onSave(fd);
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-100 dark:border-gray-800 max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between z-10">
          <h3 className="font-black text-gray-900 dark:text-white">
            {initial?.id ? '✏️ Modifier l\'article' : '✚ Nouvel article'}
          </h3>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center text-gray-500 text-sm transition-colors">
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">

          {/* Image upload */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Image (optionnelle)
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative cursor-pointer rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 hover:border-primary/50 transition-colors overflow-hidden"
            >
              {imgSrc ? (
                <img src={imgSrc} alt="preview" className="w-full h-40 object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                  <span className="text-3xl mb-1">🖼️</span>
                  <span className="text-xs font-medium">Cliquer pour ajouter une image</span>
                </div>
              )}
              {imgSrc && (
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center">
                  <span className="opacity-0 hover:opacity-100 text-white font-bold text-sm bg-black/50 px-3 py-1 rounded-full">Changer</span>
                </div>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
            {imgSrc && (
              <button onClick={() => { setImgFile(null); setPreview(null); set('image_path', null); }}
                className="mt-1 text-xs text-red-500 hover:underline">Supprimer l'image</button>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Titre *</label>
            <input
              value={form.title}
              onChange={e => set('title', e.target.value)}
              placeholder="Titre de l'article..."
              className="input w-full"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Contenu <span className="text-gray-400 normal-case font-normal">(optionnel)</span>
            </label>
            <textarea
              value={form.body || ''}
              onChange={e => set('body', e.target.value)}
              rows={5}
              placeholder="Décrivez l'actualité..."
              className="input w-full resize-none text-sm"
            />
          </div>

          {/* External link */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">
              Lien externe <span className="text-gray-400 normal-case font-normal">(optionnel)</span>
            </label>
            <input
              value={form.external_link || ''}
              onChange={e => set('external_link', e.target.value)}
              placeholder="https://..."
              type="url"
              className="input w-full text-sm"
            />
          </div>

          {/* Published toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Publié</p>
              <p className="text-xs text-gray-400">Visible sur la page d'accueil</p>
            </div>
            <button
              onClick={() => set('published', !form.published)}
              className={`w-11 h-6 rounded-full transition-colors relative ${form.published ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.published ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 btn-secondary">Annuler</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 btn-primary flex items-center justify-center gap-2">
            {loading && <Spinner size="sm" />}
            {initial?.id ? 'Enregistrer' : 'Publier'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PostsAdmin() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(null); // null | { post? }
  const [delId, setDelId] = useState(null);

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts-admin'],
    queryFn:  postService.getAll,
  });

  const createMut = useMutation({
    mutationFn: postService.create,
    onSuccess: () => { qc.invalidateQueries(['posts-admin']); qc.invalidateQueries(['posts-public']); setModal(null); toast.success('Article publié !'); },
    onError: () => toast.error('Erreur lors de la création'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, form }) => postService.update(id, form),
    onSuccess: () => { qc.invalidateQueries(['posts-admin']); qc.invalidateQueries(['posts-public']); setModal(null); toast.success('Article modifié !'); },
    onError: () => toast.error('Erreur lors de la modification'),
  });

  const deleteMut = useMutation({
    mutationFn: postService.remove,
    onSuccess: () => { qc.invalidateQueries(['posts-admin']); qc.invalidateQueries(['posts-public']); setDelId(null); toast.success('Article supprimé'); },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  function handleSave(fd) {
    if (modal?.post?.id) {
      updateMut.mutate({ id: modal.post.id, form: fd });
    } else {
      createMut.mutate(fd);
    }
  }

  const isSaving = createMut.isPending || updateMut.isPending;

  return (
    <>
      {modal !== null && (
        <PostModal
          initial={modal.post || null}
          onClose={() => setModal(null)}
          onSave={handleSave}
          loading={isSaving}
        />
      )}

      {/* Delete confirm */}
      {delId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm border border-gray-100 dark:border-gray-800 shadow-2xl">
            <p className="text-2xl mb-3 text-center">🗑️</p>
            <h3 className="font-black text-center text-gray-900 dark:text-white mb-1">Supprimer l'article ?</h3>
            <p className="text-sm text-gray-500 text-center mb-5">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDelId(null)} className="flex-1 btn-secondary">Annuler</button>
              <button onClick={() => deleteMut.mutate(delId)} disabled={deleteMut.isPending}
                className="flex-1 btn-primary bg-red-600 hover:bg-red-700 border-red-600 flex items-center justify-center gap-2">
                {deleteMut.isPending && <Spinner size="sm" />} Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link to="/admin" className="text-sm text-primary hover:underline">← Dashboard</Link>
            <h1 className="font-display text-2xl font-black text-gray-900 dark:text-white mt-1">📰 Actualités</h1>
            <p className="text-sm text-gray-500 mt-0.5">{posts.length} article{posts.length !== 1 ? 's' : ''}</p>
          </div>
          <button onClick={() => setModal({})} className="btn-primary flex items-center gap-2">
            ✚ Nouvel article
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16"><Spinner size="lg" /></div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <span className="text-5xl">📭</span>
            <p className="text-gray-400 font-medium">Aucun article pour le moment</p>
            <button onClick={() => setModal({})} className="btn-primary mt-2">Créer le premier article</button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map(post => {
              const imgSrc = post.image_path
                ? (post.image_path.startsWith('http') ? post.image_path : `${import.meta.env.VITE_API_URL || ''}${post.image_path}`)
                : null;
              return (
                <div key={post.id}
                  className="flex gap-4 p-4 rounded-2xl bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 shadow-sm">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 flex items-center justify-center">
                    {imgSrc
                      ? <img src={imgSrc} alt="" className="w-full h-full object-cover" />
                      : <span className="text-2xl text-gray-300">📄</span>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-sm text-gray-900 dark:text-white truncate">{post.title}</h3>
                      <span className={`shrink-0 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full ${post.published ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                        {post.published ? 'Publié' : 'Brouillon'}
                      </span>
                    </div>
                    {post.body && (
                      <p className="text-xs text-gray-400 line-clamp-2 mb-1">{post.body}</p>
                    )}
                    <p className="text-[10px] text-gray-400">
                      {new Date(post.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      {post.external_link && <span className="ml-2 text-primary">🔗 lien</span>}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button onClick={() => setModal({ post })}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors">
                      ✏️ Modifier
                    </button>
                    <button onClick={() => setDelId(post.id)}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition-colors">
                      🗑️ Supprimer
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
