import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { teamService } from '../../services/tournament.service';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

export default function PlayerInvites() {
  const { t }  = useTranslation();
  const qc     = useQueryClient();
  const [count, setCount] = useState(1);
  const [newLinks, setNewLinks] = useState([]);

  const { data: myTeam, isLoading: teamLoading } = useQuery({
    queryKey: ['my-team'],
    queryFn:  teamService.getMyTeam,
  });

  const teamId = myTeam?.team?.id;

  const { data: invites = [], isLoading: invLoading } = useQuery({
    queryKey: ['invites', teamId],
    queryFn:  () => teamService.getInvites(teamId),
    enabled:  !!teamId,
  });

  const genMut = useMutation({
    mutationFn: () => teamService.generateInvites(teamId, count),
    onSuccess: (links) => {
      setNewLinks(links);
      qc.invalidateQueries(['invites', teamId]);
      toast.success(`${links.length} invite link(s) generated`);
    },
    onError: (e) => toast.error(e?.response?.data?.message || 'Error generating links'),
  });

  if (teamLoading) return <div className="flex justify-center py-24"><Spinner size="lg" /></div>;
  if (!myTeam?.team) return (
    <div className="max-w-lg mx-auto px-4 py-16">
      <div className="card">
        <EmptyState
          icon="🏟️"
          title={t('invites.team_required')}
          subtitle={t('invites.team_required_sub')}
          color="green"
          size="lg"
          action={
            <Link to="/captain/team" className="btn-primary inline-flex items-center gap-2">
              <span>+</span> {t('captain.create_team')}
            </Link>
          }
        />
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link to="/captain/dashboard" className="text-sm text-primary hover:underline mb-4 inline-block">← {t('nav.dashboard')}</Link>

      <h1 className="font-display text-2xl font-bold mb-6">{t('invites.title')}</h1>

      {/* Generate section */}
      <div className="card p-5 mb-6">
        <h2 className="font-display font-bold mb-3">{t('invites.generate_title')}</h2>
        <div className="flex items-center gap-3">
          <input
            type="number"
            min="1"
            max="20"
            value={count}
            onChange={e => setCount(Number(e.target.value))}
            className="input w-24"
          />
          <button
            onClick={() => genMut.mutate()}
            disabled={genMut.isPending}
            className="btn-primary flex items-center gap-2"
          >
            {genMut.isPending && <Spinner size="sm" />}
            {t('invites.generate_btn')}
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">{t('invites.generate_info')}</p>
      </div>

      {/* Newly generated links */}
      {newLinks.length > 0 && (
        <div className="card p-5 mb-6 border-2 border-primary/30">
          <h2 className="font-display font-bold mb-3 text-primary">{t('invites.new_links_title')}</h2>
          <div className="flex flex-col gap-2">
            {newLinks.map((link, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg px-3 py-2">
                <span className="flex-1 text-xs font-mono truncate text-primary">{link}</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(link); toast.success(t('invites.copied')); }}
                  className="text-xs btn-secondary px-2 py-1"
                >
                  {t('invites.copy')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing invites */}
      <div className="card overflow-hidden">
        <div className="px-4 py-3 border-b border-border-light dark:border-border-dark">
          <h2 className="font-display font-bold">{t('invites.all_title')}</h2>
        </div>
        {invLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : invites.length === 0 ? (
          <EmptyState
            icon="🔗"
            title={t('invites.none_title')}
            subtitle={t('invites.none_sub')}
            color="blue"
            size="md"
          />
        ) : (
          <div className="divide-y divide-border-light dark:divide-border-dark">
            {invites.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                <img
                  src={p.photo_path || `https://placehold.co/40x40/1e40af/ffffff?text=${encodeURIComponent((p.first_name || '?')[0])}`}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  {p.first_name ? (
                    <>
                      <p className="font-semibold truncate">{p.first_name} {p.last_name}</p>
                      <p className="text-xs text-gray-500">#{p.jersey_number} · {p.position}</p>
                    </>
                  ) : (
                    <p className="text-gray-400 text-sm italic">{t('invites.pending_reg')}</p>
                  )}
                </div>
                <Badge variant={p.validation_status}>{p.validation_status}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
