const BG     = '#0a0f1e';
const CARD   = '#111827';
const GREEN  = '#16a34a';
const GOLD   = '#d97706';
const BORDER = '#1f2937';

const RANK_STYLE = {
  1: { bg:'rgba(217,119,6,0.15)',  border:'rgba(217,119,6,0.45)',  color:'#f59e0b' },
  2: { bg:'rgba(22,163,74,0.12)', border:'rgba(22,163,74,0.35)',  color:'#16a34a' },
};

const COLS = [
  { key:'played',        label:'J',    color:null,       bold:false },
  { key:'won',           label:'G',    color:'#22c55e',  bold:false },
  { key:'drawn',         label:'N',    color:'#f59e0b',  bold:false },
  { key:'lost',          label:'P',    color:'#f87171',  bold:false },
  { key:'goals_for',     label:'BP',   color:null,       bold:false },
  { key:'goals_against', label:'BC',   color:null,       bold:false },
  { key:'goal_diff',     label:'+/-',  color:null,       bold:false },
  { key:'points',        label:'PTS',  color:GREEN,      bold:true  },
];

const LOGO_URL = '/logo.png';

export default function GroupShareCard({ group, forwardRef }) {
  // API returns team_name / team_logo / team_id per row
  const teams = group.teams || [];

  return (
    <div ref={forwardRef} style={{
      width:540, fontFamily:"'Cairo','Tajawal','Inter',sans-serif",
      background:BG, borderRadius:24, overflow:'hidden',
      boxShadow:'0 32px 64px rgba(0,0,0,0.6)',
    }}>
      {/* Top bar */}
      <div style={{ height:4, background:`linear-gradient(90deg,${GREEN},#22c55e 50%,${GREEN})` }} />

      {/* Header */}
      <div style={{ padding:'18px 24px 14px', display:'flex', alignItems:'center', gap:14 }}>
        {/* Site logo */}
        <img
          src={LOGO_URL} alt="Mundial Lamtar"
          crossOrigin="anonymous"
          style={{ width:44, height:44, objectFit:'contain', flexShrink:0 }}
        />

        <div style={{ flex:1 }}>
          <p style={{ color:GREEN, fontSize:10, fontWeight:800, letterSpacing:3,
                      textTransform:'uppercase', margin:0 }}>Mundial Lamtar 2026</p>
          <p style={{ color:'#f1f5f9', fontWeight:900, fontSize:20, margin:'3px 0 0',
                      fontFamily:"'Cairo',sans-serif" }}>Groupe {group.letter}</p>
        </div>

        {/* Group badge */}
        <div style={{
          width:48, height:48, borderRadius:14, flexShrink:0,
          background:`linear-gradient(135deg, rgba(22,163,74,0.2), rgba(22,163,74,0.06))`,
          border:`1.5px solid rgba(22,163,74,0.35)`,
          display:'flex', alignItems:'center', justifyContent:'center',
          color:GREEN, fontWeight:900, fontSize:22, fontFamily:"'Cairo',sans-serif",
          boxShadow:`0 0 20px rgba(22,163,74,0.15)`,
        }}>{group.letter}</div>
      </div>

      {/* Table */}
      <div style={{ margin:'0 20px', background:CARD, borderRadius:12,
                    border:`1px solid ${BORDER}`, overflow:'hidden' }}>
        {/* Column headers */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr repeat(8,36px)',
                      padding:'8px 14px', borderBottom:`1px solid ${BORDER}`,
                      background:'rgba(255,255,255,0.02)' }}>
          <p style={{ color:'#4b5563', fontSize:9, fontWeight:700, letterSpacing:1.5,
                      textTransform:'uppercase', margin:0 }}>Équipe</p>
          {COLS.map(c => (
            <p key={c.key} style={{ color:c.color||'#4b5563', fontSize:9, fontWeight:700,
                                    margin:0, textAlign:'center', textTransform:'uppercase',
                                    letterSpacing:0.5 }}>{c.label}</p>
          ))}
        </div>

        {/* Team rows */}
        {teams.map((team, i) => {
          const rank = RANK_STYLE[i + 1];
          // team_logo can be a relative path from backend
          const logoSrc = team.team_logo
            ? (team.team_logo.startsWith('http')
                ? team.team_logo
                : `${import.meta.env.VITE_API_URL || ''}${team.team_logo}`)
            : `https://placehold.co/28x28/111827/16a34a?text=${encodeURIComponent((team.team_name||'?')[0])}`;

          const gd = (team.goals_for ?? 0) - (team.goals_against ?? 0);

          return (
            <div key={team.team_id || i} style={{
              display:'grid', gridTemplateColumns:'1fr repeat(8,36px)',
              padding:'10px 14px',
              borderBottom: i < teams.length - 1 ? `1px solid rgba(31,41,55,0.8)` : 'none',
              background: i === 0 ? 'rgba(217,119,6,0.04)'
                        : i === 1 ? 'rgba(22,163,74,0.03)' : 'transparent',
            }}>
              {/* Rank + logo + name */}
              <div style={{ display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
                {rank ? (
                  <div style={{ width:22, height:22, borderRadius:7, flexShrink:0,
                                background:rank.bg, border:`1px solid ${rank.border}`,
                                display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ color:rank.color, fontWeight:900, fontSize:10 }}>{i + 1}</span>
                  </div>
                ) : (
                  <span style={{ width:22, color:'#374151', fontWeight:700, fontSize:11,
                                 textAlign:'center', flexShrink:0 }}>{i + 1}</span>
                )}
                <img src={logoSrc} alt={team.team_name} crossOrigin="anonymous"
                  style={{ width:26, height:26, borderRadius:7, objectFit:'cover', flexShrink:0 }} />
                <p style={{
                  color: i < 2 ? '#e5e7eb' : '#9ca3af',
                  fontWeight: i < 2 ? 700 : 500,
                  fontSize:11, margin:0,
                  overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                  fontFamily:"'Cairo',sans-serif",
                }}>{team.team_name}</p>
              </div>

              {/* Stat cells */}
              {COLS.map(c => {
                let val = team[c.key] ?? 0;
                if (c.key === 'goal_diff') val = gd;
                const display = c.key === 'goal_diff' && gd > 0 ? `+${gd}` : val;
                return (
                  <p key={c.key} style={{
                    color: c.bold
                      ? (i === 0 ? GOLD : i === 1 ? GREEN : '#6b7280')
                      : c.color ? (Number(val) > 0 ? c.color : '#374151') : '#6b7280',
                    fontWeight: c.bold ? 800 : 500,
                    fontSize: c.bold ? 13 : 11,
                    textAlign:'center', margin:0,
                    display:'flex', alignItems:'center', justifyContent:'center',
                  }}>{display}</p>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ margin:'10px 20px 0', display:'flex', gap:14 }}>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:8, height:8, borderRadius:2, background:GOLD }} />
          <p style={{ color:'#4b5563', fontSize:9, margin:0 }}>1er — Qualifié direct</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
          <div style={{ width:8, height:8, borderRadius:2, background:GREEN }} />
          <p style={{ color:'#4b5563', fontSize:9, margin:0 }}>2ème — Qualifié</p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop:`1px solid ${BORDER}`, margin:'12px 0 0',
                    padding:'10px 24px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <p style={{ color:'#374151', fontSize:10, margin:0, fontWeight:600 }}>mundial.lamtar.net</p>
        <p style={{ color:'#1f2937', fontSize:9, margin:0, fontStyle:'italic' }}>
          From us to all – Créativité sans limite
        </p>
      </div>
    </div>
  );
}
