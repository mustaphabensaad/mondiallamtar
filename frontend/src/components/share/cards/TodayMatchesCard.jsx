const BG    = '#0a0f1e';
const CARD  = '#111827';
const GREEN = '#16a34a';
const BORDER= '#1f2937';

function MatchRow({ match, isLast }) {
  const time = match.scheduled_at
    ? new Date(match.scheduled_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})
    : '--:--';

  const isLive = match.status==='live';
  const isDone = match.status==='finished';

  const logoOrPh = (url, name) =>
    url || `https://placehold.co/36x36/111827/16a34a?text=${encodeURIComponent((name||'?')[0])}`;

  return (
    <div style={{
      display:'grid', gridTemplateColumns:'1fr 88px 1fr',
      alignItems:'center', gap:10, padding:'12px 14px',
      borderBottom: isLast ? 'none' : `1px solid rgba(31,41,55,0.7)`,
      background: isLive ? 'rgba(239,68,68,0.03)' : 'transparent',
    }}>
      {/* Home */}
      <div style={{ display:'flex', alignItems:'center', gap:8, justifyContent:'flex-end' }}>
        <p style={{ color: isLive||isDone ? '#e5e7eb' : '#9ca3af', fontWeight:700, fontSize:12,
                    margin:0, textAlign:'right', fontFamily:"'Cairo',sans-serif" }}>
          {match.home_team_name}
        </p>
        <img src={logoOrPh(match.home_team_logo, match.home_team_name)} alt="" crossOrigin="anonymous"
          style={{ width:30, height:30, borderRadius:8, objectFit:'cover', flexShrink:0 }} />
      </div>

      {/* Center */}
      <div style={{ textAlign:'center' }}>
        {isLive || isDone ? (
          <>
            <div style={{
              background: isLive ? 'rgba(239,68,68,0.1)' : CARD,
              border:`1px solid ${isLive ? 'rgba(239,68,68,0.3)' : BORDER}`,
              borderRadius:10, padding:'5px 10px', display:'inline-block',
            }}>
              <p style={{ color:'#f1f5f9', fontWeight:900, fontSize:18, margin:0,
                          fontVariantNumeric:'tabular-nums', letterSpacing:-0.5 }}>
                {match.home_score??0}–{match.away_score??0}
              </p>
            </div>
            <p style={{
              color: isLive ? '#ef4444' : GREEN,
              fontSize:8, fontWeight:800, letterSpacing:1.5,
              margin:'4px 0 0', textTransform:'uppercase',
            }}>
              {isLive ? '● LIVE' : 'FT'}
            </p>
          </>
        ) : (
          <>
            <p style={{ color:'#f1f5f9', fontWeight:800, fontSize:15, margin:0 }}>{time}</p>
            <p style={{ color:'#374151', fontSize:8, fontWeight:700, letterSpacing:1,
                        margin:'3px 0 0', textTransform:'uppercase' }}>Programmé</p>
          </>
        )}
      </div>

      {/* Away */}
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <img src={logoOrPh(match.away_team_logo, match.away_team_name)} alt="" crossOrigin="anonymous"
          style={{ width:30, height:30, borderRadius:8, objectFit:'cover', flexShrink:0 }} />
        <p style={{ color: isLive||isDone ? '#e5e7eb' : '#9ca3af', fontWeight:700, fontSize:12,
                    margin:0, fontFamily:"'Cairo',sans-serif" }}>
          {match.away_team_name}
        </p>
      </div>
    </div>
  );
}

export default function TodayMatchesCard({ matches = [], forwardRef }) {
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday:'long', day:'numeric', month:'long', year:'numeric',
  });

  const live  = matches.filter(m => m.status==='live').length;
  const done  = matches.filter(m => m.status==='finished').length;
  const sched = matches.filter(m => m.status==='scheduled').length;

  return (
    <div ref={forwardRef} style={{
      width:540, fontFamily:"'Cairo','Tajawal','Inter',sans-serif",
      background:BG, borderRadius:24, overflow:'hidden',
      boxShadow:'0 32px 64px rgba(0,0,0,0.6)',
    }}>
      {/* Top bar */}
      <div style={{ height:4, background:`linear-gradient(90deg,${GREEN},#22c55e 50%,${GREEN})` }} />

      {/* Header */}
      <div style={{ padding:'20px 28px 16px', display:'flex', alignItems:'flex-start', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
          <img src="/logo.png" alt="Logo" crossOrigin="anonymous"
            style={{ width:40, height:40, objectFit:'contain', flexShrink:0, marginTop:2 }} />
          <div>
            <p style={{ color:GREEN, fontSize:10, fontWeight:800, letterSpacing:3,
                        textTransform:'uppercase', margin:0 }}>Mundial Lamtar 2026</p>
            <p style={{ color:'#f1f5f9', fontWeight:900, fontSize:20, margin:'5px 0 0',
                        fontFamily:"'Cairo',sans-serif" }}>Programme du jour</p>
            <p style={{ color:'#4b5563', fontSize:11, margin:'3px 0 0', textTransform:'capitalize' }}>{today}</p>
          </div>
        </div>
        {/* Badges */}
        <div style={{ display:'flex', flexDirection:'column', gap:5, alignItems:'flex-end' }}>
          {live>0 && (
            <span style={{ background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)',
                           borderRadius:20, padding:'3px 10px', fontSize:9,
                           fontWeight:800, color:'#ef4444', letterSpacing:1 }}>● {live} LIVE</span>
          )}
          <span style={{ background:'rgba(22,163,74,0.08)', border:'1px solid rgba(22,163,74,0.2)',
                         borderRadius:20, padding:'3px 10px', fontSize:9,
                         fontWeight:700, color:GREEN }}>{matches.length} matchs</span>
        </div>
      </div>

      {/* Match rows */}
      <div style={{ margin:'0 20px', background:CARD, borderRadius:14,
                    border:`1px solid ${BORDER}`, overflow:'hidden' }}>
        {matches.length===0 ? (
          <p style={{ color:'#374151', textAlign:'center', padding:'28px 0',
                      fontSize:13, margin:0 }}>Aucun match aujourd'hui</p>
        ) : (
          matches.map((m, i) => <MatchRow key={m.id} match={m} isLast={i===matches.length-1} />)
        )}
      </div>

      {/* Summary pills */}
      {matches.length > 0 && (
        <div style={{ padding:'12px 20px 0', display:'flex', gap:8 }}>
          {sched>0 && (
            <span style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${BORDER}`,
                           borderRadius:20, padding:'3px 10px', fontSize:9, color:'#4b5563', fontWeight:600 }}>
              {sched} à venir
            </span>
          )}
          {done>0 && (
            <span style={{ background:'rgba(22,163,74,0.07)', border:'1px solid rgba(22,163,74,0.15)',
                           borderRadius:20, padding:'3px 10px', fontSize:9, color:GREEN, fontWeight:600 }}>
              {done} terminé{done>1?'s':''}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ borderTop:`1px solid ${BORDER}`, margin:'14px 0 0', padding:'12px 28px',
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
