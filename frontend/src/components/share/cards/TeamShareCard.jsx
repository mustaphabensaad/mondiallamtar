const BG    = '#0a0f1e';
const CARD  = '#111827';
const GREEN = '#16a34a';
const GOLD  = '#d97706';
const BORDER= '#1f2937';

const POS_META = {
  GK:  { color:'#f59e0b', bg:'rgba(245,158,11,0.12)',  label:'G' },
  DEF: { color:'#60a5fa', bg:'rgba(96,165,250,0.10)',  label:'D' },
  MID: { color:'#a78bfa', bg:'rgba(167,139,250,0.10)', label:'M' },
  FWD: { color:GREEN,     bg:'rgba(22,163,74,0.12)',   label:'A' },
};

export default function TeamShareCard({ team, players = [], forwardRef }) {
  const logoSrc = team.logo_path
    ? (team.logo_path.startsWith('http') ? team.logo_path
       : `${import.meta.env.VITE_API_URL||''}${team.logo_path}`)
    : `https://placehold.co/100x100/111827/16a34a?text=${encodeURIComponent((team.name||'?')[0])}`;

  const stats = [
    { label:'PTS', value:team.points??0,     color:GOLD,    highlight:true },
    { label:'J',   value:team.played??0,      color:'#60a5fa' },
    { label:'G',   value:team.won??0,          color:GREEN },
    { label:'N',   value:team.drawn??0,        color:'#f59e0b' },
    { label:'P',   value:team.lost??0,         color:'#f87171' },
    { label:'BP',  value:team.goals_for??0,    color:'#a78bfa' },
  ];

  const posOrder = { GK:0, DEF:1, MID:2, FWD:3 };
  const sorted = [...players].sort((a,b) => (posOrder[a.position]??9)-(posOrder[b.position]??9));

  const byPos = { GK:[], DEF:[], MID:[], FWD:[] };
  sorted.forEach(p => { if (byPos[p.position]) byPos[p.position].push(p); });

  return (
    <div ref={forwardRef} style={{
      width:540, fontFamily:"'Cairo','Tajawal','Inter',sans-serif",
      background:BG, borderRadius:24, overflow:'hidden',
      boxShadow:'0 32px 64px rgba(0,0,0,0.6)',
    }}>
      {/* Top bar */}
      <div style={{ height:4, background:`linear-gradient(90deg,${GREEN},#22c55e 50%,${GREEN})` }} />

      {/* Hero section */}
      <div style={{
        padding:'24px 28px 22px',
        background:`linear-gradient(135deg, rgba(22,163,74,0.06) 0%, transparent 60%)`,
        borderBottom:`1px solid ${BORDER}`,
        display:'flex', alignItems:'center', gap:20,
      }}>
        {/* Logo with glow */}
        <div style={{
          padding:3, borderRadius:20, flexShrink:0,
          background:`linear-gradient(135deg, ${GREEN}, #22c55e, rgba(22,163,74,0.3))`,
          boxShadow:`0 0 28px rgba(22,163,74,0.3)`,
        }}>
          <img src={logoSrc} alt={team.name} crossOrigin="anonymous"
            style={{ width:84, height:84, borderRadius:16, objectFit:'cover', display:'block', background:CARD }} />
        </div>

        <div style={{ flex:1 }}>
          <img src="/logo.png" alt="Logo" crossOrigin="anonymous"
          style={{ width:36, height:36, objectFit:'contain', marginBottom:4 }} />
        <p style={{ color:GREEN, fontSize:9, fontWeight:800, letterSpacing:3,
                      textTransform:'uppercase', margin:0 }}>Mundial Lamtar 2026</p>
          <p style={{ color:'#f1f5f9', fontWeight:900, fontSize:22, margin:'5px 0 0',
                      lineHeight:1.2, fontFamily:"'Cairo',sans-serif" }}>{team.name}</p>
          <div style={{ display:'flex', alignItems:'center', flexWrap:'wrap', gap:6, marginTop:8 }}>
            {team.group_letter && (
              <span style={{ background:'rgba(22,163,74,0.12)', border:'1px solid rgba(22,163,74,0.3)',
                             borderRadius:20, padding:'3px 10px', fontSize:10,
                             fontWeight:700, color:GREEN }}>Groupe {team.group_letter}</span>
            )}
            {team.coach_name && (
              <span style={{ color:'#4b5563', fontSize:10, fontWeight:500 }}>
                Coach: <span style={{color:'#9ca3af'}}>{team.coach_name}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ padding:'16px 20px', display:'grid',
                    gridTemplateColumns:'repeat(6,1fr)', gap:8 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: s.highlight ? `rgba(217,119,6,0.08)` : 'rgba(255,255,255,0.02)',
            border:`1px solid ${s.highlight ? 'rgba(217,119,6,0.2)' : BORDER}`,
            borderRadius:12, padding:'10px 0', textAlign:'center',
            boxShadow: s.highlight ? '0 0 14px rgba(217,119,6,0.08)' : 'none',
          }}>
            <p style={{ color:s.color, fontWeight:900, fontSize: s.highlight?22:20, margin:0,
                        fontVariantNumeric:'tabular-nums' }}>{s.value}</p>
            <p style={{ color:'#374151', fontSize:8, fontWeight:700, letterSpacing:1.5,
                        margin:'3px 0 0', textTransform:'uppercase' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Players grid by position */}
      {sorted.length > 0 && (
        <div style={{ padding:'0 20px 20px' }}>
          <p style={{ color:'#374151', fontSize:9, fontWeight:800, letterSpacing:2,
                      textTransform:'uppercase', margin:'0 0 10px' }}>Effectif</p>
          <div style={{ background:CARD, borderRadius:12, border:`1px solid ${BORDER}`,
                        overflow:'hidden' }}>
            {Object.entries(byPos).filter(([,ps]) => ps.length>0).map(([pos, ps], gi) => {
              const pm = POS_META[pos] || POS_META.MID;
              return (
                <div key={pos} style={{
                  borderBottom: gi < Object.values(byPos).filter(x=>x.length>0).length-1
                    ? `1px solid rgba(31,41,55,0.6)` : 'none',
                  padding:'8px 14px', display:'flex', alignItems:'flex-start', gap:10,
                }}>
                  <div style={{ width:20, height:20, borderRadius:6, flexShrink:0, marginTop:1,
                                background:pm.bg, border:`1px solid ${pm.color}30`,
                                display:'flex', alignItems:'center', justifyContent:'center',
                                color:pm.color, fontSize:9, fontWeight:800 }}>{pm.label}</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'4px 10px', flex:1 }}>
                    {ps.map(p => (
                      <span key={p.id} style={{ color:'#9ca3af', fontSize:11, fontWeight:500 }}>
                        <span style={{ color:pm.color, fontWeight:700, marginRight:3 }}>
                          {p.jersey_number ? `#${p.jersey_number}` : ''}
                        </span>
                        {p.first_name} {p.last_name}
                        {p.goals>0 && <span style={{color:GREEN}}> ⚽{p.goals}</span>}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
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
