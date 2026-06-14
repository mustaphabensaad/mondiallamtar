import { imgUrl } from '../../../utils/imageUrl';

const BG     = '#0a0f1e';
const CARD   = '#0f172a';
const GOLD   = '#d97706';
const GOLD2  = '#f59e0b';
const BORDER = '#1f2937';

function Star({ style }) {
  return <span style={{ color: GOLD2, fontSize: 12, lineHeight: 1, ...style }}>★</span>;
}

export default function MotmShareCard({ match }) {
  const photo = imgUrl(match.motm_photo);
  const homeScore = match.home_score ?? 0;
  const awayScore = match.away_score ?? 0;

  const matchDate = match.scheduled_at
    ? new Date(match.scheduled_at).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric',
      })
    : null;

  const homeLogo = imgUrl(match.home_team_logo);
  const awayLogo = imgUrl(match.away_team_logo);

  const nameParts = (match.motm_name || '').trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName  = nameParts.slice(1).join(' ') || '';

  return (
    <div style={{
      width: 540,
      fontFamily: "'Cairo','Tajawal','Inter',sans-serif",
      background: BG,
      borderRadius: 24,
      overflow: 'hidden',
      boxShadow: '0 32px 64px rgba(0,0,0,0.7)',
      position: 'relative',
    }}>

      {/* ── Top gold accent bar ── */}
      <div style={{ height: 4, background: `linear-gradient(90deg,${GOLD},${GOLD2} 50%,${GOLD})` }} />

      {/* ── Hero section ── */}
      <div style={{ position: 'relative', height: 240, overflow: 'hidden' }}>

        {/* Gold diagonal left fill */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(135deg,#78350f,${GOLD})`,
          clipPath: 'polygon(0 0, 55% 0, 35% 100%, 0 100%)',
        }} />

        {/* Dark right side */}
        <div style={{
          position: 'absolute', inset: 0,
          background: CARD,
          clipPath: 'polygon(55% 0, 100% 0, 100% 100%, 35% 100%)',
        }} />

        {/* Stars watermark */}
        <div style={{
          position: 'absolute', right: 18, top: 8,
          fontSize: 80, color: 'rgba(245,158,11,0.06)',
          lineHeight: 1, letterSpacing: 2, userSelect: 'none',
        }}>★★★</div>

        {/* Photo */}
        <div style={{
          position: 'absolute', left: 155, top: 16,
          width: 155, height: 200,
          borderRadius: 18,
          overflow: 'hidden',
          border: `3px solid ${GOLD}`,
          boxShadow: `0 0 40px ${GOLD}80, 0 8px 32px rgba(0,0,0,0.5)`,
          background: CARD,
        }}>
          {photo ? (
            <img
              src={photo}
              alt={match.motm_name}
              crossOrigin="anonymous"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 56, color: GOLD2, background: `${GOLD}15`,
              fontWeight: 900,
            }}>
              {(match.motm_name || '?')[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Left panel — MOTM badge */}
        <div style={{ position: 'absolute', left: 20, top: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* MOTM badge */}
          <div style={{
            background: `linear-gradient(135deg,${GOLD},${GOLD2})`,
            borderRadius: 10, padding: '6px 14px',
          }}>
            <p style={{ color: '#000', fontSize: 9, fontWeight: 900, letterSpacing: 2,
                        textTransform: 'uppercase', margin: 0 }}>Man of</p>
            <p style={{ color: '#000', fontSize: 9, fontWeight: 900, letterSpacing: 2,
                        textTransform: 'uppercase', margin: 0 }}>the Match</p>
          </div>

          {/* Star icon */}
          <div style={{
            background: 'rgba(217,119,6,0.15)', border: `1.5px solid ${GOLD}60`,
            borderRadius: 10, padding: '4px 10px', display: 'inline-block',
          }}>
            <p style={{ color: GOLD2, fontSize: 18, margin: 0, textAlign: 'center', lineHeight: 1 }}>⭐</p>
          </div>
        </div>

        {/* Right panel — branding + name */}
        <div style={{ position: 'absolute', right: 0, top: 0, width: 200, padding: '20px 20px 0 8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <img src="/logo.png" alt="Logo" crossOrigin="anonymous"
              style={{ width: 30, height: 30, objectFit: 'contain', flexShrink: 0 }} />
            <p style={{ color: GOLD2, fontSize: 8, fontWeight: 800, letterSpacing: 2,
                        textTransform: 'uppercase', margin: 0, lineHeight: 1.3 }}>
              Mundial<br/>Lamtar 2026
            </p>
          </div>

          <p style={{ color: '#f8fafc', fontWeight: 900, fontSize: 22, margin: '0 0 2px',
                      lineHeight: 1.1, fontFamily: "'Cairo',sans-serif", textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            {firstName}
          </p>
          <p style={{ color: GOLD2, fontWeight: 800, fontSize: 17, margin: '0 0 10px',
                      lineHeight: 1.1, fontFamily: "'Cairo',sans-serif" }}>
            {lastName.toUpperCase() || firstName.toUpperCase()}
          </p>

          {match.motm_team_name && (
            <p style={{ color: '#6b7280', fontSize: 10, margin: '0 0 4px', fontWeight: 600,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              🏟 {match.motm_team_name}
            </p>
          )}
          {matchDate && (
            <p style={{ color: '#6b7280', fontSize: 10, margin: 0, fontWeight: 600 }}>
              📅 {matchDate}
            </p>
          )}

          {/* Stars */}
          <div style={{ display: 'flex', gap: 2, marginTop: 10 }}>
            {[1,2,3,4,5].map(i => <Star key={i} />)}
          </div>
        </div>
      </div>

      {/* ── Match scoreboard ── */}
      <div style={{
        margin: '0', padding: '14px 24px',
        background: `linear-gradient(90deg,rgba(120,53,15,0.15),rgba(217,119,6,0.08),rgba(120,53,15,0.15))`,
        borderTop: `1px solid ${GOLD}30`, borderBottom: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0,
      }}>
        {/* Home team */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          {homeLogo ? (
            <img src={homeLogo} alt={match.home_team_name} crossOrigin="anonymous"
              style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 8 }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#1e3a8a',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: 14, fontWeight: 900 }}>
              {(match.home_team_name || '?')[0]}
            </div>
          )}
          <p style={{ color: '#e2e8f0', fontSize: 10, fontWeight: 700, margin: 0,
                      textAlign: 'center', maxWidth: 80,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {match.home_team_name}
          </p>
        </div>

        {/* Score */}
        <div style={{ padding: '0 20px', textAlign: 'center' }}>
          <p style={{ color: '#fff', fontSize: 36, fontWeight: 900, margin: 0,
                      lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: -1 }}>
            {homeScore}<span style={{ color: '#374151', margin: '0 4px' }}>–</span>{awayScore}
          </p>
          <p style={{ color: GOLD, fontSize: 8, fontWeight: 800, letterSpacing: 2,
                      textTransform: 'uppercase', margin: '4px 0 0' }}>Résultat final</p>
        </div>

        {/* Away team */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          {awayLogo ? (
            <img src={awayLogo} alt={match.away_team_name} crossOrigin="anonymous"
              style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 8 }} />
          ) : (
            <div style={{ width: 36, height: 36, borderRadius: 8, background: '#1e3a8a',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: 14, fontWeight: 900 }}>
              {(match.away_team_name || '?')[0]}
            </div>
          )}
          <p style={{ color: '#e2e8f0', fontSize: 10, fontWeight: 700, margin: 0,
                      textAlign: 'center', maxWidth: 80,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {match.away_team_name}
          </p>
        </div>
      </div>

      {/* ── MOTM quote / trophy strip ── */}
      <div style={{
        padding: '12px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
        borderBottom: `1px solid ${BORDER}`,
      }}>
        <span style={{ fontSize: 22 }}>🏆</span>
        <p style={{ color: GOLD2, fontSize: 12, fontWeight: 700, margin: 0,
                    fontStyle: 'italic', textAlign: 'center' }}>
          Meilleur joueur du match
        </p>
        <span style={{ fontSize: 22 }}>🏆</span>
      </div>

      {/* ── Footer ── */}
      <div style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ color: '#374151', fontSize: 10, margin: 0, fontWeight: 600 }}>mundial.lamtar.net</p>
        <div style={{ display: 'flex', gap: 2 }}>
          {[1,2,3].map(i => <Star key={i} />)}
        </div>
        <p style={{ color: '#1f2937', fontSize: 9, margin: 0, fontStyle: 'italic' }}>From us to all</p>
      </div>
    </div>
  );
}
