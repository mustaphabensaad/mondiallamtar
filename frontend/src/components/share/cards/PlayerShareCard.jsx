import { imgUrl } from '../../../utils/imageUrl';

const BG    = '#0a0f1e';
const CARD  = '#111827';
const GREEN = '#16a34a';
const GOLD  = '#d97706';
const BORDER= '#1f2937';

const POS = {
  GK:  { color:'#f59e0b', bg:'rgba(245,158,11,0.12)',  border:'rgba(245,158,11,0.3)',  label:'Gardien de but',  stripe:'#78350f,#92400e' },
  DEF: { color:'#60a5fa', bg:'rgba(96,165,250,0.10)',  border:'rgba(96,165,250,0.3)',  label:'Défenseur',       stripe:'#1e3a5f,#1e40af' },
  MID: { color:'#a78bfa', bg:'rgba(167,139,250,0.10)', border:'rgba(167,139,250,0.3)', label:'Milieu de terrain',stripe:'#312e81,#4c1d95' },
  FWD: { color:GREEN,     bg:'rgba(22,163,74,0.12)',   border:'rgba(22,163,74,0.3)',   label:'Attaquant',       stripe:'#052e16,#14532d' },
};

export default function PlayerShareCard({ player, forwardRef }) {
  const pos  = POS[player.position] || POS.MID;
  const photo = imgUrl(player.photo_path);

  const age = player.date_of_birth
    ? Math.floor((Date.now()-new Date(player.date_of_birth))/(365.25*24*3600*1000))
    : null;

  const stats = [
    { label:'Buts',      value:player.goals??0,        icon:'⚽', color:GREEN,    highlight:(player.goals??0)>0 },
    { label:'Passes D',  value:player.assists??0,       icon:'🎯', color:'#a78bfa',highlight:(player.assists??0)>0 },
    { label:'Jaunards',  value:player.yellow_cards??0,  icon:'🟨', color:'#f59e0b',highlight:(player.yellow_cards??0)>0 },
    { label:'Rouges',    value:player.red_cards??0,     icon:'🟥', color:'#f87171',highlight:(player.red_cards??0)>0 },
  ];

  return (
    <div ref={forwardRef} style={{
      width:540, fontFamily:"'Cairo','Tajawal','Inter',sans-serif",
      background:BG, borderRadius:24, overflow:'hidden',
      boxShadow:'0 32px 64px rgba(0,0,0,0.6)',
    }}>
      {/* Top bar */}
      <div style={{ height:4, background:`linear-gradient(90deg,${GREEN},#22c55e 50%,${GREEN})` }} />

      {/* Hero section — photo + identity side by side */}
      <div style={{
        padding:'22px 28px 22px',
        background:`linear-gradient(135deg, ${pos.bg} 0%, transparent 55%)`,
        borderBottom:`1px solid ${BORDER}`,
        display:'flex', alignItems:'center', gap:20,
      }}>
        {/* Photo */}
        <div style={{ flexShrink:0, position:'relative' }}>
          <div style={{
            padding:3, borderRadius:20,
            background:`linear-gradient(135deg, ${pos.color}, rgba(22,163,74,0.3))`,
            boxShadow:`0 0 28px ${pos.color}40`,
          }}>
            {photo ? (
              <img src={photo} alt={`${player.first_name} ${player.last_name}`} crossOrigin="anonymous"
                style={{ width:88, height:88, borderRadius:16, objectFit:'cover',
                         objectPosition:'top center', display:'block', background:CARD }} />
            ) : (
              <div style={{ width:88, height:88, borderRadius:16, background:CARD,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:36, color:pos.color }}>👤</div>
            )}
          </div>
          {/* Jersey number badge */}
          {player.jersey_number && (
            <div style={{
              position:'absolute', bottom:-6, right:-6,
              background:pos.color, color: pos.color===GREEN?'#fff':'#000',
              fontWeight:900, fontSize:11, width:22, height:22, borderRadius:7,
              display:'flex', alignItems:'center', justifyContent:'center',
              border:`2px solid ${BG}`,
            }}>#{player.jersey_number}</div>
          )}
        </div>

        {/* Identity */}
        <div style={{ flex:1 }}>
          <img src="/logo.png" alt="Logo" crossOrigin="anonymous"
            style={{ width:36, height:36, objectFit:'contain', marginBottom:4 }} />
          <p style={{ color:GREEN, fontSize:9, fontWeight:800, letterSpacing:3,
                      textTransform:'uppercase', margin:0 }}>Mundial Lamtar 2026</p>
          <p style={{ color:'#f1f5f9', fontWeight:900, fontSize:22, margin:'5px 0 0',
                      lineHeight:1.2, fontFamily:"'Cairo',sans-serif" }}>
            {player.first_name}<br/>
            <span style={{ color:'#9ca3af', fontWeight:700 }}>{player.last_name}</span>
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:10 }}>
            <span style={{ background:pos.bg, border:`1px solid ${pos.border}`,
                           borderRadius:20, padding:'3px 10px', fontSize:10,
                           fontWeight:700, color:pos.color }}>{pos.label}</span>
            {age && (
              <span style={{ color:'#4b5563', fontSize:10, fontWeight:500,
                             display:'flex', alignItems:'center' }}>{age} ans</span>
            )}
            {player.is_validated && (
              <span style={{ background:'rgba(22,163,74,0.1)', border:'1px solid rgba(22,163,74,0.25)',
                             borderRadius:20, padding:'3px 8px', fontSize:9,
                             fontWeight:700, color:GREEN }}>✓ Validé</span>
            )}
          </div>
          {player.team_name && (
            <p style={{ color:'#4b5563', fontSize:11, margin:'8px 0 0', fontWeight:500 }}>
              🏟 <span style={{color:'#6b7280'}}>{player.team_name}</span>
            </p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding:'16px 20px', display:'grid',
                    gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: s.highlight ? `${s.color}10` : 'rgba(255,255,255,0.02)',
            border:`1px solid ${s.highlight ? `${s.color}25` : BORDER}`,
            borderRadius:12, padding:'12px 0', textAlign:'center',
            boxShadow: s.highlight ? `0 0 12px ${s.color}15` : 'none',
          }}>
            <p style={{ fontSize:18, margin:0 }}>{s.icon}</p>
            <p style={{ color: s.highlight ? s.color : '#374151', fontWeight:900,
                        fontSize:22, margin:'4px 0 0', fontVariantNumeric:'tabular-nums' }}>
              {s.value}
            </p>
            <p style={{ color:'#374151', fontSize:8, fontWeight:700, letterSpacing:1,
                        margin:'3px 0 0', textTransform:'uppercase' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Bio */}
      {player.bio && (
        <div style={{ margin:'0 20px 20px', padding:'12px 14px',
                      background:'rgba(255,255,255,0.02)', border:`1px solid ${BORDER}`,
                      borderRadius:12, borderLeft:`3px solid ${pos.color}` }}>
          <p style={{ color:'#6b7280', fontSize:11, lineHeight:1.7, margin:0, fontStyle:'italic' }}>
            {player.bio.slice(0,160)}{player.bio.length>160?'…':''}
          </p>
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop:`1px solid ${BORDER}`, padding:'12px 28px',
                    display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:24, height:24, borderRadius:6,
                        background:'rgba(22,163,74,0.15)', border:'1px solid rgba(22,163,74,0.3)',
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>🦅</div>
          <p style={{ color:'#374151', fontSize:10, margin:0, fontWeight:600 }}>mundial.lamtar.net</p>
        </div>
        <p style={{ color:'#1f2937', fontSize:9, margin:0, fontStyle:'italic' }}>
          From us to all – Créativité sans limite
        </p>
      </div>
    </div>
  );
}
