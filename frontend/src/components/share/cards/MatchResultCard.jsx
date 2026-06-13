/**
 * MatchResultCard — cinematic match result card.
 * Design system: #0a0f1e bg · #16a34a green · #d97706 gold · Cairo font
 */
import { imgUrl } from '../../../utils/imageUrl';

const BG      = '#0a0f1e';
const CARD    = '#111827';
const GREEN   = '#16a34a';
const GOLD    = '#d97706';
const GOLD_L  = '#f59e0b';
const BORDER  = '#1f2937';

function TeamCol({ name, logo, goals, isWinner }) {
  const src = imgUrl(logo) || `https://placehold.co/80x80/111827/16a34a?text=${encodeURIComponent((name||'?')[0])}`;
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10, flex:1 }}>
      {/* Logo ring */}
      <div style={{
        padding: isWinner ? 3 : 2,
        borderRadius: 20,
        background: isWinner
          ? `linear-gradient(135deg, ${GREEN}, #22c55e, ${GREEN})`
          : `linear-gradient(135deg, ${BORDER}, #374151)`,
        boxShadow: isWinner ? `0 0 20px rgba(22,163,74,0.4)` : 'none',
      }}>
        <img
          src={src}
          alt={name}
          crossOrigin="anonymous"
          style={{ width:72, height:72, borderRadius:16, objectFit:'cover', display:'block',
                   background: CARD }}
        />
      </div>
      <p style={{ color:'#f1f5f9', fontWeight:800, fontSize:13, textAlign:'center', margin:0,
                  lineHeight:1.3, maxWidth:130, fontFamily:"'Cairo','Tajawal',sans-serif" }}>
        {name}
      </p>
      {isWinner && (
        <div style={{ background:`rgba(22,163,74,0.15)`, border:`1px solid rgba(22,163,74,0.4)`,
                      borderRadius:20, padding:'2px 10px', fontSize:9, fontWeight:700,
                      color:GREEN, letterSpacing:1, textTransform:'uppercase' }}>
          Vainqueur
        </div>
      )}
      {/* Scorers */}
      {goals.length > 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:3, alignItems:'center', marginTop:2 }}>
          {goals.map((g, i) => (
            <p key={i} style={{ color:'#6b7280', fontSize:10, margin:0, fontWeight:500 }}>
              ⚽ {g.player_name} <span style={{color:'#4b5563'}}>{g.minute}'</span>
              {g.event_type==='own_goal' && <span style={{color:'#ef4444'}}> (csc)</span>}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

export default function MatchResultCard({ match, events = [], forwardRef }) {
  const goals = events.filter(e => ['goal','own_goal','penalty_scored'].includes(e.event_type));

  const homeGoals = goals.filter(e =>
    e.event_type==='own_goal' ? e.team_id!==match.home_team_id : e.team_id===match.home_team_id
  );
  const awayGoals = goals.filter(e =>
    e.event_type==='own_goal' ? e.team_id!==match.away_team_id : e.team_id===match.away_team_id
  );

  const hs = match.home_score ?? 0;
  const as_ = match.away_score ?? 0;
  const homeWins = hs > as_;
  const awayWins = as_ > hs;
  const draw = hs === as_;

  const date = match.scheduled_at
    ? new Date(match.scheduled_at).toLocaleDateString('fr-FR',{ day:'numeric', month:'long', year:'numeric' })
    : '';

  const phaseLabel = {
    group:'Phase de groupes', round_of_16:'Huitièmes', quarter_final:'Quarts',
    semi_final:'Demi-finale', final:'⭐ FINALE',
  }[match.phase] || match.phase || '';

  return (
    <div ref={forwardRef} style={{
      width:540, fontFamily:"'Cairo','Tajawal','Inter',sans-serif",
      background: BG, borderRadius:24, overflow:'hidden',
      boxShadow:'0 32px 64px rgba(0,0,0,0.6)',
    }}>

      {/* ── Top gradient bar ── */}
      <div style={{ height:4, background:`linear-gradient(90deg, ${GREEN}, #22c55e 50%, ${GREEN})` }} />

      {/* ── Header ── */}
      <div style={{ padding:'18px 28px 14px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <img src="/logo.png" alt="Logo" crossOrigin="anonymous"
            style={{ width:40, height:40, objectFit:'contain', flexShrink:0 }} />
          <div>
            <p style={{ color:GREEN, fontSize:10, fontWeight:800, letterSpacing:3,
                        textTransform:'uppercase', margin:0 }}>Mundial Lamtar 2026</p>
            <p style={{ color:'#4b5563', fontSize:10, margin:'3px 0 0', fontWeight:500 }}>{date}</p>
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:4 }}>
          {phaseLabel && (
            <span style={{ background:'rgba(22,163,74,0.1)', border:`1px solid rgba(22,163,74,0.25)`,
                           borderRadius:20, padding:'3px 10px', fontSize:9, fontWeight:700,
                           color:GREEN, letterSpacing:1, textTransform:'uppercase' }}>
              {phaseLabel}
            </span>
          )}
          {match.group_letter && (
            <span style={{ color:'#4b5563', fontSize:10, fontWeight:600 }}>Groupe {match.group_letter}</span>
          )}
        </div>
      </div>

      {/* ── Main scoreboard ── */}
      <div style={{ padding:'8px 24px 28px', display:'grid',
                    gridTemplateColumns:'1fr 160px 1fr', alignItems:'center', gap:12 }}>
        <TeamCol name={match.home_team_name} logo={match.home_team_logo} goals={homeGoals} isWinner={homeWins} />

        {/* Score center */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
          <div style={{
            background: CARD, borderRadius:20,
            border:`1px solid ${draw ? 'rgba(100,116,139,0.3)' : 'rgba(22,163,74,0.2)'}`,
            padding:'14px 20px', textAlign:'center', width:'100%',
            boxShadow: draw ? 'none' : `0 0 24px rgba(22,163,74,0.12)`,
          }}>
            <p style={{ fontSize:54, fontWeight:900, color:'#f8fafc', margin:0, lineHeight:1,
                        letterSpacing:-3, fontVariantNumeric:'tabular-nums' }}>
              <span style={{ color: homeWins ? GREEN : draw ? '#64748b' : '#f8fafc' }}>{hs}</span>
              <span style={{ color:'#1f2937', margin:'0 8px', fontSize:40 }}>–</span>
              <span style={{ color: awayWins ? GREEN : draw ? '#64748b' : '#f8fafc' }}>{as_}</span>
            </p>
            <p style={{ color:draw?'#64748b':GREEN, fontSize:9, fontWeight:800, margin:'8px 0 0',
                        letterSpacing:2, textTransform:'uppercase' }}>
              {match.status==='finished' ? 'Temps réglementaire' : 'LIVE'}
            </p>
          </div>

          {match.venue && (
            <p style={{ color:'#374151', fontSize:9, textAlign:'center', margin:0, lineHeight:1.4 }}>
              📍 {match.venue}
            </p>
          )}
        </div>

        <TeamCol name={match.away_team_name} logo={match.away_team_logo} goals={awayGoals} isWinner={awayWins} />
      </div>

      {/* ── MOTM ── */}
      {match.motm_player_name && (
        <div style={{ margin:'0 28px 20px', padding:'12px 16px',
                      background:`linear-gradient(135deg, rgba(217,119,6,0.1), rgba(217,119,6,0.05))`,
                      border:`1px solid rgba(217,119,6,0.25)`, borderRadius:14,
                      display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:36, height:36, borderRadius:10,
                        background:`rgba(217,119,6,0.15)`, border:`1px solid rgba(217,119,6,0.3)`,
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>
            ⭐
          </div>
          <div>
            <p style={{ color:GOLD, fontSize:9, fontWeight:800, letterSpacing:2,
                        textTransform:'uppercase', margin:0 }}>Homme du Match</p>
            <p style={{ color:'#f1f5f9', fontWeight:700, fontSize:14, margin:'3px 0 0',
                        fontFamily:"'Cairo',sans-serif" }}>{match.motm_player_name}</p>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <div style={{ borderTop:`1px solid ${BORDER}`, padding:'12px 28px',
                    display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:24, height:24, borderRadius:6,
                        background:`rgba(22,163,74,0.15)`, border:`1px solid rgba(22,163,74,0.3)`,
                        display:'flex', alignItems:'center', justifyContent:'center', fontSize:12 }}>
            🦅
          </div>
          <p style={{ color:'#374151', fontSize:10, margin:0, fontWeight:600 }}>mundial.lamtar.net</p>
        </div>
        <p style={{ color:'#1f2937', fontSize:9, margin:0, fontStyle:'italic' }}>
          From us to all – Créativité sans limite
        </p>
      </div>
    </div>
  );
}
