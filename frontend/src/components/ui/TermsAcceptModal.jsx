import { useState } from 'react';

/**
 * Modal that displays the official tournament commitment paragraph.
 * The user must tick the checkbox before the confirm button is enabled.
 *
 * Props:
 *   isOpen      – boolean
 *   teamName    – string (optional, shown in the paragraph)
 *   onAccept    – () => void  called when user confirms
 *   onClose     – () => void  called if the modal is dismissed (optional)
 */
export default function TermsAcceptModal({ isOpen, teamName = '', onAccept, onClose }) {
  const [checked, setChecked] = useState(false);

  if (!isOpen) return null;

  function handleAccept() {
    if (!checked) return;
    setChecked(false);
    onAccept();
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget && onClose) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div className="w-full max-w-lg bg-white dark:bg-[#111827] rounded-3xl shadow-2xl overflow-hidden" dir="rtl">

        {/* Header */}
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-6 py-5 text-white text-center relative">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
          <img src="/logo.png" alt="Mundial Lamtar 2026" className="w-14 h-14 rounded-2xl object-cover mx-auto mb-3 shadow-lg" />
          <h2 className="font-display font-black text-lg mb-0.5">استمارة التزام وتعهد</h2>
          <p className="text-gray-400 text-xs">#مونديال_لمطار_2026 — الدستور التنظيمي الرسمي (26 مادة)</p>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">

          {/* Tribute */}
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl px-4 py-2.5 text-amber-700 dark:text-amber-400 text-xs">
            <span className="text-base">🦅</span>
            <span>طبعة الوفاء — إلى روح الشهيد <strong>بن نجة يوسف</strong> والراحل <strong>بوجمعة سليمان</strong></span>
          </div>

          {/* Commitment paragraph */}
          <div className="bg-gray-50 dark:bg-gray-900/60 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-4 text-sm leading-loose text-gray-700 dark:text-gray-300 space-y-3">
            <p>
              أنا الموقع أدناه، قائد/مدرب فريق:{' '}
              {teamName
                ? <strong className="text-gray-900 dark:text-gray-100">{teamName}</strong>
                : <span className="inline-block border-b border-dashed border-gray-400 w-32 align-bottom" />
              }
              ، أُقر بأنني قرأت وفهمت{' '}
              <span className="font-bold text-gray-900 dark:text-gray-100">
                "الدستور التنظيمي لدورة #مونديال_لمطار_2026"
              </span>{' '}
              (26 مادة)، وأتعهد بالالتزام التام بها وبجميع القرارات الصادرة عن اللجنة المنظمة
              {' '}(حماني أيوب أو عبادة محمد).
            </p>
            <p>
              كما أقر بأنني المسؤول عن إطلاع كافة أعضاء فريقي على هذه القوانين، وأقبل بجميع
              العقوبات المترتبة على مخالفتها أو الإساءة لعتاد الدورة أو المنظمين.
            </p>
          </div>

          {/* Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer select-none group">
            <div className="relative mt-0.5 shrink-0">
              <input
                type="checkbox"
                className="sr-only"
                checked={checked}
                onChange={e => setChecked(e.target.checked)}
              />
              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                checked
                  ? 'bg-primary border-primary'
                  : 'border-gray-300 dark:border-gray-600 group-hover:border-primary/60'
              }`}>
                {checked && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
              أقر بأنني قرأت وفهمت الدستور التنظيمي كاملاً (26 مادة) وأوافق على جميع بنوده
            </span>
          </label>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleAccept}
              disabled={!checked}
              className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-all ${
                checked
                  ? 'bg-primary text-white shadow-md hover:bg-primary/90 active:scale-95'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              أقبل وأتعهد بالالتزام ✓
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-5 py-3 rounded-2xl font-semibold text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                لاحقاً
              </button>
            )}
          </div>

          <p className="text-center text-xs text-gray-400">
            يمكنك قراءة الدستور الكامل في{' '}
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              صفحة القوانين
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
