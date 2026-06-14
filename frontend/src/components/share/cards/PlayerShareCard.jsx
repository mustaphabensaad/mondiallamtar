import { imgUrl } from '../../../utils/imageUrl';

const BG     = '#0a0f1e';
const CARD   = '#0f172a';
const GREEN  = '#16a34a';
const BORDER = '#1f2937';

const POS = {
  GK:  { color:'#f59e0b', dark:'#78350f', label:'GK',  labelFull:'Gardien',        grad:'linear-gradient(135deg,#78350f,#d97706)' },
  DEF: { color:'#3b82f6', dark:'#1e3a8a', label:'DEF', labelFull:'Défenseur',       grad:'linear-gradient(135deg,#1e3a8a,#3b82f6)' },
  MID: { color:'#8b5cf6', dark:'#3b0764', label:'MID', labelFull:'Milieu',          grad:'linear-gradient(135deg,#3b0764,#7c3aed)' },
  FWD: { color:'#16a34a', dark:'#052e16', label:'ATT', labelFull:'Attaquant',       grad:'linear-gradient(135deg,#052e16,#16a34a)' },
};

function Star({ style }) {
  return <span style={{ color:'#d97706', fontSize:10, lineHeight:1, ...style }}>★</span>;
}

export default function PlayerShareCard({ player }) {
  const pos   = POS[player.position] || POS.MID;
  const photo = imgUrl(player.photo_path);

  const age = player.date_of_birth
    ? Math.floor((Date.now() - new Date(player.date_of_birth)) / (365.25 * 24 * 3600 * 1000))
    : null;

  const stats = [
    { label:'Buts',   value: player.goals ?? 0,        icon:'⚽', color: GREEN },
    { label:'Jaunes', value: player.yellow_cards ?? 0,  icon:'🟨', color:'#f59e0b' },
    { label:'Rouges', value: player.red_cards ?? 0,     icon:'🟥', color:'#ef4444' },
  ];

  const initials = `${(player.first_name||'?')[0]}${(player.last_name||'')[0]||''}`.toUpperCase();

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

      {/* ── Top accent bar ── */}
      <div style={{ height: 4, background: `linear-gradient(90deg,${GREEN},#22c55e 50%,${GREEN})` }} />

      {/* ── Hero: colored diagonal + photo ── */}
      <div style={{ position: 'relative', height: 230, overflow: 'hidden' }}>

        {/* Diagonal color fill */}
        <div style={{
          position: 'absolute', inset: 0,
          background: pos.grad,
          clipPath: 'polygon(0 0, 58% 0, 38% 100%, 0 100%)',
        }} />

        {/* Dark right side */}
        <div style={{
          position: 'absolute', inset: 0,
          background: CARD,
          clipPath: 'polygon(58% 0, 100% 0, 100% 100%, 38% 100%)',
        }} />

        {/* Big jersey number watermark */}
        {player.jersey_number && (
          <div style={{
            position: 'absolute', right: 20, top: -10,
            fontSize: 140, fontWeight: 900, color: 'rgba(255,255,255,0.04)',
            lineHeight: 1, userSelect: 'none', fontVariantNumeric: 'tabular-nums',
            fontFamily: "'Cairo',sans-serif",
          }}>
            {player.jersey_number}
          </div>
        )}

        {/* Photo centered on the diagonal boundary */}
        <div style={{
          position: 'absolute', left: 160, top: 20,
          width: 150, height: 190,
          borderRadius: 18,
          overflow: 'hidden',
          border: `3px solid ${pos.color}`,
          boxShadow: `0 0 40px ${pos.color}60, 0 8px 32px rgba(0,0,0,0.5)`,
          background: CARD,
        }}>
          {photo ? (
            <img
              src={photo}
              alt={`${player.first_name} ${player.last_name}`}
              crossOrigin="anonymous"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 56, color: pos.color, background: `${pos.color}15` }}>
              {initials}
            </div>
          )}
        </div>

        {/* Left panel — position + captain badge */}
        <div style={{ position: 'absolute', left: 24, top: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Position badge */}
          <div style={{
            background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
            border: `1.5px solid ${pos.color}60`,
            borderRadius: 10, padding: '6px 14px', display: 'inline-block',
          }}>
            <p style={{ color: pos.color, fontSize: 11, fontWeight: 900, letterSpacing: 2,
                        textTransform: 'uppercase', margin: 0 }}>{pos.label}</p>
          </div>

          {/* Jersey # pill */}
          {player.jersey_number && (
            <div style={{
              background: pos.color, borderRadius: 10,
              padding: '4px 12px', display: 'inline-block', alignSelf: 'flex-start',
            }}>
              <p style={{ color: '#fff', fontSize: 14, fontWeight: 900, margin: 0 }}>#{player.jersey_number}</p>
            </div>
          )}

          {/* Captain crown */}
          {!!player.is_captain && (
            <div style={{
              background: 'rgba(217,119,6,0.2)', border: '1px solid rgba(217,119,6,0.5)',
              borderRadius: 10, padding: '4px 10px', display: 'inline-block',
            }}>
              <p style={{ color: '#f59e0b', fontSize: 10, fontWeight: 800, margin: 0 }}>👑 Capitaine</p>
            </div>
          )}
        </div>

        {/* Right panel — branding + name */}
        <div style={{ position: 'absolute', right: 0, top: 0, width: 205, padding: '20px 20px 0 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <img src="/logo.png" alt="Logo" crossOrigin="anonymous"
              style={{ width: 30, height: 30, objectFit: 'contain', flexShrink: 0 }} />
            <p style={{ color: GREEN, fontSize: 8, fontWeight: 800, letterSpacing: 2,
                        textTransform: 'uppercase', margin: 0, lineHeight: 1.3 }}>
              Mundial<br/>Lamtar 2026
            </p>
          </div>

          <p style={{ color: '#f8fafc', fontWeight: 900, fontSize: 20, margin: '0 0 2px',
                      lineHeight: 1.1, fontFamily: "'Cairo',sans-serif", textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            {player.first_name}
          </p>
          <p style={{ color: pos.color, fontWeight: 800, fontSize: 16, margin: '0 0 8px',
                      lineHeight: 1.1, fontFamily: "'Cairo',sans-serif" }}>
            {player.last_name?.toUpperCase()}
          </p>

          {/* Sub-info */}
          {age && (
            <p style={{ color: '#6b7280', fontSize: 10, margin: '0 0 3px', fontWeight: 600 }}>
              🎂 {age} ans
            </p>
          )}
          {player.team_name && (
            <p style={{ color: '#6b7280', fontSize: 10, margin: 0, fontWeight: 600,
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              🏟 {player.team_name}
            </p>
          )}

          {/* Stars decoration */}
          <div style={{ display: 'flex', gap: 2, marginTop: 10 }}>
            {[1,2,3,4,5].map(i => <Star key={i} />)}
          </div>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
        borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`,
      }}>
        {stats.map((s, i) => (
          <div key={s.label} style={{
            padding: '14px 0', textAlign: 'center',
            borderRight: i < stats.length - 1 ? `1px solid ${BORDER}` : 'none',
            background: (s.value > 0) ? `${s.color}08` : 'transparent',
          }}>
            <p style={{ fontSize: 20, margin: 0, lineHeight: 1 }}>{s.icon}</p>
            <p style={{ color: s.value > 0 ? s.color : '#374151', fontWeight: 900,
                        fontSize: 28, margin: '4px 0 0', fontVariantNumeric: 'tabular-nums' }}>
              {s.value}
            </p>
            <p style={{ color: '#4b5563', fontSize: 9, fontWeight: 700, letterSpacing: 1.5,
                        textTransform: 'uppercase', margin: '3px 0 0' }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Bio ── */}
      {player.bio && (
        <div style={{ margin: '12px 20px', padding: '10px 14px',
                      background: 'rgba(255,255,255,0.02)', border: `1px solid ${BORDER}`,
                      borderRadius: 10, borderLeft: `3px solid ${pos.color}` }}>
          <p style={{ color: '#6b7280', fontSize: 11, lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
            {player.bio.slice(0, 140)}{player.bio.length > 140 ? '…' : ''}
          </p>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ color: '#374151', fontSize: 10, margin: 0, fontWeight: 600 }}>mundial.lamtar.net</p>
        <div style={{ display: 'flex', gap: 2 }}>
          {[1,2,3].map(i => <Star key={i} />)}
        </div>
        <p style={{ color: '#1f2937', fontSize: 9, margin: 0, fontStyle: 'italic' }}>
          From us to all
        </p>
      </div>
    </div>
  );
}
