import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { tournamentService } from '../../services/tournament.service';

export default function HeroCarousel() {
  const { i18n } = useTranslation();
  const lang = i18n.language || 'fr';
  const { data: images = [] } = useQuery({
    queryKey: ['association-images'],
    queryFn:  tournamentService.getImages,
  });

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length === 0) return;
    const t = setInterval(() => setCurrent(c => (c + 1) % images.length), 4000);
    return () => clearInterval(t);
  }, [images.length]);

  if (images.length === 0) {
    return (
      <div className="card overflow-hidden h-52 sm:h-72 bg-gradient-to-r from-primary/20 to-secondary/20
                      flex items-center justify-center text-gray-400 text-sm">
        Loading carousel...
      </div>
    );
  }

  const img = images[current];
  const title = img[`title_${lang}`] || img.title_fr;
  const desc  = img[`description_${lang}`] || img.description_fr;

  return (
    <div className="card overflow-hidden relative h-52 sm:h-72 select-none">
      <img
        src={img.image_path}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      {/* Text */}
      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white">
        <h2 className="font-display font-bold text-lg sm:text-2xl leading-snug">{title}</h2>
        {desc && <p className="text-sm text-white/80 mt-1 line-clamp-2">{desc}</p>}
      </div>

      {/* Dots */}
      <div className="absolute bottom-3 right-4 flex gap-1.5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-white' : 'bg-white/40'}`}
          />
        ))}
      </div>
    </div>
  );
}
