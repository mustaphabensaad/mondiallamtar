import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { postService } from '../../services/tournament.service';
import Spinner from '../ui/Spinner';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function excerpt(text, max = 120) {
  if (!text) return '';
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text;
}

async function sharePost(post, apiBase) {
  const url = post.external_link || window.location.href;
  if (navigator.share) {
    await navigator.share({ title: post.title, text: excerpt(post.body, 80), url });
  } else {
    await navigator.clipboard.writeText(url);
  }
}

function PostCard({ post }) {
  const { t } = useTranslation();
  const hasImage = !!post.image_path;
  const imgSrc   = post.image_path?.startsWith('http')
    ? post.image_path
    : `${import.meta.env.VITE_API_URL || ''}${post.image_path}`;

  return (
    <article className="group flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">

      {/* Image */}
      {hasImage ? (
        <div className="relative h-40 overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
          <img
            src={imgSrc}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={e => { e.target.parentElement.style.display = 'none'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span className="absolute bottom-2 left-3 text-[10px] font-semibold text-white/80 bg-black/30 backdrop-blur-sm px-2 py-0.5 rounded-full">
            {formatDate(post.created_at)}
          </span>
        </div>
      ) : (
        <div className="h-1.5 w-full bg-gradient-to-r from-primary/60 via-primary to-primary/60 shrink-0" />
      )}

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        {!hasImage && (
          <span className="text-[10px] font-semibold text-gray-400">{formatDate(post.created_at)}</span>
        )}

        <Link to={`/posts/${post.id}`}>
          <h3 className="font-display font-bold text-sm text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
        </Link>

        {post.body && (
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-3 flex-1">
            {excerpt(post.body, 150)}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
          {post.external_link && (
            <a
              href={post.external_link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 text-center text-[10px] font-bold text-primary border border-primary/30 rounded-lg py-1.5 hover:bg-primary/5 transition-colors"
            >
              {t('home.posts_link')} ↗
            </a>
          )}
          <button
            onClick={() => sharePost(post)}
            className="flex items-center gap-1 text-[10px] font-bold text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            title={t('home.posts_share')}
          >
            <span>⤴</span> {t('home.posts_share')}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function PostsFeed() {
  const { t } = useTranslation();
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['posts-public'],
    queryFn:  () => postService.getPublished(6),
  });

  if (isLoading) return (
    <div className="flex justify-center py-10"><Spinner size="md" /></div>
  );

  if (posts.length === 0) return (
    <div className="flex flex-col items-center gap-3 py-10 text-center">
      <span className="text-4xl">📰</span>
      <p className="text-sm text-gray-400 font-medium">{t('home.posts_empty')}</p>
    </div>
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {posts.map(p => <PostCard key={p.id} post={p} />)}
    </div>
  );
}
