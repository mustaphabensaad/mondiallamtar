import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { playerService } from '../../services/tournament.service';
import Spinner from './Spinner';
import ShareCardModal from '../share/ShareCardModal';
import PlayerShareCard from '../share/cards/PlayerShareCard';

import { imgUrl } from '../../utils/imageUrl';

const POSITION_META = {
  GK:  { label: 'Gardien',   color: 'bg-yellow-500', text: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-400/50', strip: 'from-yellow-500 to-amber-400',   glow: 'shadow-yellow-500/20' },
  DEF: { label: 'Défenseur', color: 'bg-blue-500',   text: 'text-blue-600 dark:text-blue-400',     border: 'border-blue-400/50',   strip: 'from-blue-600 to-blue-400',      glow: 'shadow-blue-500/20'   },
  MID: { label: 'Milieu',    color: 'bg-green-500',  text: 'text-green-600 dark:text-green-400',   border: 'border-green-400/50',  strip: 'from-green-600 to-emerald-400',  glow: 'shadow-green-500/20'  },
  FWD: { label: 'Attaquant', color: 'bg-red-500',    text: 'text-red-600 dark:text-red-400',       border: 'border-red-400/50',    strip: 'from-red-600 to-orange-400',     glow: 'shadow-red-500/20'    },
};

function StatBox({ icon, value, label, color, highlight }) {
  return (
    <div className="flex flex-col items-center gap-1 py-4 px-3">
      <span className="text-xl leading-none">{icon}</span>
      <span className={`text-2xl font-black tabular-nums ${highlight ? color : 'text-gray-300 dark:text-gray-600'}`}>
        {value ?? 0}
      </span>
      <span className="text-[10px] uppercase tracking-widest font-bold text-gray-400">{label}</span>
    </div>
  );
}

export default function PlayerModal({ playerId, onClose }) {
  const [showExport, setShowExport] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { data: player, isLoading } = useQuery({
    queryKey: ['player', playerId],
    queryFn:  () => playerService.getById(playerId),
    enabled:  !!playerId,
  });

  const pos       = POSITION_META[player?.position] || POSITION_META.MID;
  const photo     = imgUrl(player?.photo_path);
  const showPhoto = photo && !imgError;
  const initials = player
    ? `${(player.first_name || '?')[0]}${(player.last_name || '')[0] || ''}`.toUpperCase()
    : '?';
  const age = player?.date_of_birth
    ? Math.floor((Date.now() - new Date(player.date_of_birth)) / (365.25 * 24 * 3600 * 1000))
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 flex items-center justify-center text-white text-sm transition-colors"
        >✕</button>

        {isLoading || !player ? (
          <div className="flex justify-center items-center h-64">
            <Spinner size="lg" />
          </div>
        ) : (
          <>
            {/* Hero gradient banner */}
            <div className={`relative bg-gradient-to-br ${pos.strip} h-32 flex items-end pb-0 overflow-hidden`}>
              <div className="absolute inset-0 bg-black/20" />
              {/* Jersey number */}
              <span className="absolute top-4 left-5 text-white/30 font-black text-7xl leading-none tabular-nums select-none">
                {player.jersey_number ?? '—'}
              </span>
              {/* Photo — overlaps banner */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
                <div className={`w-20 h-20 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-gray-900 shadow-xl ${pos.glow} shadow-lg`}>
                  {showPhoto ? (
                    <img
                      src={photo}
                      alt={`${player.first_name} ${player.last_name}`}
                      className="w-full h-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className={`w-full h-full flex items-center justify-center text-white font-black text-xl ${pos.color}`}>
                      {initials}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="pt-14 px-5 pb-5">

              {/* Identity */}
              <div className="text-center mb-4">
                <h2 className="font-display font-black text-xl text-gray-900 dark:text-white leading-tight">
                  {player.first_name} {player.last_name}
                </h2>
                <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full text-white ${pos.color}`}>
                    {pos.label}
                  </span>
                  {age && <span className="text-xs text-gray-400 font-medium">{age} ans</span>}
                  {player.is_validated ? (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">✓ Validé</span>
                  ) : (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">En attente</span>
                  )}
                  {player.status === 'suspended' && (
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600">Suspendu</span>
                  )}
                </div>
              </div>

              {/* Team */}
              <Link
                to={`/teams/${player.team_id}`}
                onClick={onClose}
                className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 hover:bg-primary/5 dark:hover:bg-primary/10 transition-colors mb-4 group"
              >
                <img
                  src={imgUrl(player.team_logo) || `https://placehold.co/36x36/16a34a/ffffff?text=${encodeURIComponent((player.team_name || '?')[0])}`}
                  alt={player.team_name}
                  className="w-9 h-9 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Équipe</p>
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate group-hover:text-primary transition-colors">
                    {player.team_name}
                  </p>
                </div>
                <span className="text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors">›</span>
              </Link>

              {/* Bio */}
              {player.bio && (
                <div className={`mb-4 px-4 py-3 rounded-2xl border border-dashed ${pos.border} bg-gray-50 dark:bg-gray-800/40`}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">Expérience</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{player.bio}</p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                <StatBox icon="⚽" value={player.goals}        label="Buts"   color="text-green-500"  highlight={player.goals > 0} />
                <StatBox icon="🟨" value={player.yellow_cards} label="Jaunes" color="text-yellow-500" highlight={player.yellow_cards > 0} />
                <StatBox icon="🟥" value={player.red_cards}    label="Rouges" color="text-red-500"    highlight={player.red_cards > 0} />
              </div>

              {/* Export */}
              <button
                onClick={() => setShowExport(true)}
                className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors"
              >
                📤 Exporter la carte joueur
              </button>
            </div>
          </>
        )}
      </div>

      {player && (
        <ShareCardModal
          isOpen={showExport}
          onClose={() => setShowExport(false)}
          title={`${player.first_name} ${player.last_name}`}
          filename={`joueur-${player.first_name}-${player.last_name}.png`.replace(/\s+/g, '-')}
        >
          <PlayerShareCard player={player} />
        </ShareCardModal>
      )}
    </div>
  );
}
