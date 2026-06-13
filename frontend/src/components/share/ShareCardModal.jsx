import { useRef, useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { useTranslation } from 'react-i18next';

/**
 * ShareCardModal — full-screen dark preview with fast PNG export.
 *
 * Performance fix: card is rendered at natural size (no CSS transform scale).
 * html2canvas uses scale:2 internally → 1080px output without layout thrash.
 *
 * Props:
 *   isOpen    : boolean
 *   onClose   : () => void
 *   title     : string
 *   filename  : string
 *   children  : the card JSX (540px wide, all inline styles)
 */
export default function ShareCardModal({ isOpen, onClose, title, filename = 'card.png', children }) {
  const cardRef      = useRef(null);
  const [state, setState] = useState('idle'); // idle | capturing | done | error
  const { t } = useTranslation();

  const handleDownload = useCallback(async () => {
    if (!cardRef.current || state === 'capturing') return;
    setState('capturing');

    try {
      // Small delay so React finishes painting before we capture
      await new Promise(r => setTimeout(r, 80));

      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        logging: false,
        imageTimeout: 3000,
        removeContainer: true,
      });

      canvas.toBlob(blob => {
        if (!blob) { setState('error'); return; }
        const url = URL.createObjectURL(blob);
        const a   = Object.assign(document.createElement('a'), { href: url, download: filename });
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setState('done');
        setTimeout(() => setState('idle'), 2500);
      }, 'image/png');
    } catch (err) {
      console.error('Export failed:', err);
      setState('error');
      setTimeout(() => setState('idle'), 2500);
    }
  }, [filename, state]);

  if (!isOpen) return null;

  const busy = state === 'capturing';

  return (
    <div
      style={{
        position:'fixed', inset:0, zIndex:9999,
        background:'rgba(0,0,0,0.85)', backdropFilter:'blur(8px)',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        padding:24,
      }}
      onClick={e => { if (e.target===e.currentTarget) onClose(); }}
    >
      {/* Modal shell */}
      <div style={{
        background:'#0a0f1e', borderRadius:20,
        border:'1px solid #1f2937',
        boxShadow:'0 32px 80px rgba(0,0,0,0.7)',
        width:'100%', maxWidth:600,
        display:'flex', flexDirection:'column',
        maxHeight:'92vh', overflow:'hidden',
      }}>

        {/* ── Header ── */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'16px 20px', borderBottom:'1px solid #1f2937', flexShrink:0,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{
              width:32, height:32, borderRadius:10,
              background:'rgba(22,163,74,0.12)', border:'1px solid rgba(22,163,74,0.25)',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:15,
            }}>📤</div>
            <div>
              <p style={{ color:'#f1f5f9', fontWeight:700, fontSize:14, margin:0,
                          fontFamily:"'Cairo','Tajawal',sans-serif" }}>{title || 'Exporter la carte'}</p>
              <p style={{ color:'#374151', fontSize:10, margin:'2px 0 0' }}>
                Aperçu avant téléchargement
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width:32, height:32, borderRadius:8, border:'none', cursor:'pointer',
              background:'rgba(255,255,255,0.05)', color:'#6b7280',
              display:'flex', alignItems:'center', justifyContent:'center', fontSize:16,
              transition:'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.color='#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='#6b7280'; }}
          >✕</button>
        </div>

        {/* ── Card preview area ── */}
        <div style={{
          overflowY:'auto', overflowX:'hidden',
          padding:'24px',
          display:'flex', justifyContent:'center',
          background:'#050810',
          flex:1,
        }}>
          {/* Captured area — natural 540px render */}
          <div
            ref={cardRef}
            style={{
              width:540, flexShrink:0,
              /* ensure fonts are loaded before capture */
              fontFamily:"'Cairo','Tajawal','Inter',sans-serif",
            }}
          >
            {children}
          </div>
        </div>

        {/* ── Footer / Actions ── */}
        <div style={{
          padding:'14px 20px', borderTop:'1px solid #1f2937',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          gap:12, flexShrink:0,
        }}>
          <p style={{ color:'#374151', fontSize:11, margin:0, flex:1 }}>
            {state==='done'   ? '✓ PNG téléchargé avec succès !'
            : state==='error' ? '✗ Erreur lors de l\'export — réessayez'
            : 'Téléchargez puis partagez sur WhatsApp, Facebook…'}
          </p>

          <div style={{ display:'flex', gap:8, flexShrink:0 }}>
            <button
              onClick={onClose}
              style={{
                padding:'8px 16px', borderRadius:10, border:'1px solid #1f2937',
                background:'transparent', color:'#6b7280', fontSize:12, fontWeight:600,
                cursor:'pointer', transition:'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='#111827'; e.currentTarget.style.color='#f1f5f9'; }}
              onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='#6b7280'; }}
            >
              Fermer
            </button>

            <button
              onClick={handleDownload}
              disabled={busy}
              style={{
                padding:'8px 20px', borderRadius:10, border:'none', cursor: busy?'wait':'pointer',
                background: state==='done' ? '#16a34a' : state==='error' ? '#dc2626' : '#16a34a',
                color:'#fff', fontSize:12, fontWeight:700,
                display:'flex', alignItems:'center', gap:7,
                opacity: busy ? 0.7 : 1,
                transition:'all 0.15s',
                boxShadow: busy ? 'none' : '0 0 16px rgba(22,163,74,0.3)',
              }}
              onMouseEnter={e => { if (!busy) e.currentTarget.style.background='#15803d'; }}
              onMouseLeave={e => { if (!busy) e.currentTarget.style.background='#16a34a'; }}
            >
              {busy ? (
                <>
                  <span style={{
                    width:12, height:12, border:'2px solid rgba(255,255,255,0.3)',
                    borderTopColor:'#fff', borderRadius:'50%',
                    animation:'spin 0.7s linear infinite', display:'inline-block',
                  }} />
                  Génération…
                </>
              ) : state==='done' ? (
                <>✓ Téléchargé</>
              ) : (
                <>⬇ Télécharger PNG</>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Spinner keyframe */}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
