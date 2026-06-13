import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { tournamentService } from '../../services/tournament.service';

const INTERVAL = 5000;

export default function HeroCarousel() {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'fr';

  const { data: images = [] } = useQuery({
    queryKey: ['association-images'],
    queryFn:  tournamentService.getImages,
  });

  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);

  const next = useCallback(() => {
    setCurrent(c => (c + 1) % images.length);
    setProgress(0);
  }, [images.length]);

  // Auto-advance + progress bar
  useEffect(() => {
    if (images.length === 0) return;
    setProgress(0);
    const step = 50;
    const tick = INTERVAL / (100 / (step * 100 / INTERVAL));
    const prog = setInterval(() => setProgress(p => Math.min(p + (step / INTERVAL) * 100, 100)), step);
    const adv  = setInterval(next, INTERVAL);
    return () => { clearInterval(prog); clearInterval(adv); };
  }, [images.length, next, current]);

  if (images.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm
        h-52 sm:h-72 bg-gradient-to-br from-[#0f1c2e] via-[#0a1628] to-[#0d1f14]
        flex flex-col items-center justify-center text-center px-6 relative">
        {/* Decorative circles */}
        <div className="absolute top-4 right-6 w-20 h-20 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute bottom-4 left-6 w-24 h-24 rounded-full bg-secondary/10 blur-2xl" />

        <img src="/logo.png" alt="Mundial Lamtar 2026" className="w-24 h-24 rounded-2xl object-cover mx-auto mb-3 relative shadow-xl" />
        <h2 className="relative font-display font-black text-2xl sm:text-3xl text-white leading-tight mb-1">
          مونديال لمطار 2026
        </h2>
        <p className="relative text-primary font-bold text-sm sm:text-base mb-1">#مونديال_لمطار_2026</p>
        <p className="relative text-gray-400 text-xs italic mb-3">From us to all – Créativité sans limite</p>
        <div className="relative px-4 py-2 bg-amber-500/10 border border-amber-500/25 rounded-xl text-xs text-amber-400 font-medium">
          🦅 طبعة الوفاء — إلى روح الشهيد الطيار بن نجة يوسف
        </div>
      </div>
    );
  }

  const img   = images[current];
  const title = img[`title_${lang}`]       || img.title_fr;
  const desc  = img[`description_${lang}`] || img.description_fr;

  return (
    <div className="overflow-hidden rounded-2xl relative h-52 sm:h-72 select-none shadow-md border border-gray-200 dark:border-gray-800">
      {/* Image — fade transition via CSS opacity trick */}
      {images.map((im, i) => {
        const t = im[`title_${lang}`] || im.title_fr;
        return (
          <div
            key={i}
            className={`absolute inset-0 transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0'}`}
          >
            <img
              src={im.image_path}
              alt={t}
              className="w-full h-full object-cover"
            />
          </div>
        );
      })}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 pointer-events-none" />

      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/20">
        <div
          className="h-full bg-white/80 transition-none"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Slide counter */}
      <div className="absolute top-3 right-4 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-0.5">
        <span className="text-[10px] text-white/70 font-mono tabular-nums">
          {current + 1} / {images.length}
        </span>
      </div>

      {/* Text */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
        <h2 className="font-display font-black text-lg sm:text-2xl leading-snug drop-shadow-lg">
          {title}
        </h2>
        {desc && (
          <p className="text-sm text-white/75 mt-1 line-clamp-2 leading-relaxed">
            {desc}
          </p>
        )}
      </div>

      {/* Dot navigation */}
      <div className="absolute bottom-4 right-4 flex gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => { setCurrent(i); setProgress(0); }}
            aria-label={`Slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? 'w-6 h-2 bg-white'
                : 'w-2 h-2 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>

      {/* Prev/next arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => { setCurrent(c => (c - 1 + images.length) % images.length); setProgress(0); }}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-all"
          >
            ‹
          </button>
          <button
            onClick={() => { next(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm flex items-center justify-center text-white/80 hover:text-white transition-all"
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}
