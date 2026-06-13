import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { postService } from '../services/tournament.service';
import Spinner from '../components/ui/Spinner';

function formatDate(dateStr, lng) {
  return new Date(dateStr).toLocaleDateString(lng === 'ar' ? 'ar-DZ' : lng === 'fr' ? 'fr-FR' : 'en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

async function share(post) {
  const url = window.location.href;
  if (navigator.share) {
    await navigator.share({ title: post.title, text: post.body?.slice(0, 100) || '', url });
  } else {
    await navigator.clipboard.writeText(url);
  }
}

export default function PostDetail() {
  const { id }       = useParams();
  const { t, i18n } = useTranslation();
  const navigate     = useNavigate();
  const isRtl        = i18n.dir() === 'rtl';

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['post', id],
    queryFn:  () => postService.getById(id),
  });

  if (isLoading) return (
    <div className="flex justify-center py-32"><Spinner size="lg" /></div>
  );

  if (isError || !post) return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <p className="text-5xl mb-4">📭</p>
      <h1 className="font-display text-2xl font-bold mb-2 text-gray-900 dark:text-white">Article introuvable</h1>
      <p className="text-gray-500 mb-6">Cet article n'existe pas ou n'est plus disponible.</p>
      <Link to="/" className="btn-primary">← Retour à l'accueil</Link>
    </div>
  );

  const imgSrc = post.image_path
    ? (post.image_path.startsWith('http') ? post.image_path : `${import.meta.env.VITE_API_URL || ''}${post.image_path}`)
    : null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors mb-8 group"
      >
        <span className={`transition-transform group-hover:${isRtl ? 'translate-x-1' : '-translate-x-1'}`}>
          {isRtl ? '→' : '←'}
        </span>
        {t('home.posts_title')}
      </button>

      <article>

        {/* Hero image */}
        {imgSrc && (
          <div className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden mb-8 bg-gray-100 dark:bg-gray-800">
            <img
              src={imgSrc}
              alt={post.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm shrink-0">📰</div>
          <div>
            <p className="text-xs font-semibold text-primary uppercase tracking-widest">
              {t('home.posts_title')}
            </p>
            <p className="text-xs text-gray-400">{formatDate(post.created_at, i18n.language)}</p>
          </div>
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl sm:text-3xl font-black text-gray-900 dark:text-white leading-tight mb-6">
          {post.title}
        </h1>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-primary/40 via-primary/10 to-transparent mb-6" />

        {/* Body */}
        {post.body && (
          <div className="prose prose-sm sm:prose dark:prose-invert max-w-none mb-8">
            {post.body.split('\n').filter(Boolean).map((para, i) => (
              <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed text-base mb-4">
                {para}
              </p>
            ))}
          </div>
        )}

        {/* Actions bar */}
        <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-gray-100 dark:border-gray-800">
          {post.external_link && (
            <a
              href={post.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="
                inline-flex items-center gap-2 px-4 py-2 rounded-xl
                bg-primary text-white text-sm font-bold
                hover:opacity-90 hover:shadow-md transition-all duration-200
                shadow-[0_2px_12px_rgba(var(--color-primary-rgb,59,130,246),0.3)]
              "
            >
              {t('home.posts_link')} ↗
            </a>
          )}

          <button
            onClick={() => share(post)}
            className="
              inline-flex items-center gap-2 px-4 py-2 rounded-xl
              bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300
              text-sm font-bold border border-gray-200 dark:border-gray-700
              hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors
            "
          >
            <span className="text-base">⤴</span> {t('home.posts_share')}
          </button>

          <Link
            to="/"
            className="
              ms-auto inline-flex items-center gap-1.5 text-sm text-gray-400
              hover:text-primary transition-colors font-medium
            "
          >
            {isRtl ? '→' : '←'} {t('nav.home')}
          </Link>
        </div>

      </article>

      {/* Footer card */}
      <div className="mt-10 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/10 p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl shrink-0">🦅</div>
        <div>
          <p className="text-sm font-bold text-gray-800 dark:text-white">Mundial Lamtar 2026</p>
          <p className="text-xs text-gray-400 italic">From us to all – Créativité sans limite</p>
        </div>
      </div>

    </div>
  );
}
