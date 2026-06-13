import { useCallback, useRef } from 'react';
import html2canvas from 'html2canvas';

/**
 * Hook that returns:
 *   - ref       → attach to the card DOM node you want to capture
 *   - capture() → returns a Promise<Blob>
 *   - download(filename) → capture + auto-download PNG
 */
export function useCardExport() {
  const ref = useRef(null);

  const capture = useCallback(async () => {
    if (!ref.current) throw new Error('Card ref not attached');
    const canvas = await html2canvas(ref.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
    });
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('toBlob failed')), 'image/png');
    });
  }, []);

  const download = useCallback(async (filename = 'card.png') => {
    const blob = await capture();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, [capture]);

  return { ref, capture, download };
}
