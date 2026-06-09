import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const CONTACTS = [
  { name: 'حماني أيوب',  role: 'إدارة المونديال',       phone: '0670062056', whatsapp: true,  telegram: true },
  { name: 'عبادة محمد',  role: 'إدارة المونديال',       phone: '0665181513', whatsapp: true,  telegram: true },
  { name: 'حمودة حليش', role: 'مسؤول انضمام الفرق',   phone: '0698748579', whatsapp: false, telegram: false },
];

const ARTICLES = [
  {
    num: '١', icon: '🏗️', title: 'الهيكل التنظيمي',
    color: 'from-blue-500 to-indigo-600',
    items: [
      'تُنظَّم البطولة على مرحلتين: دور المجموعات ثم الأدوار الإقصائية',
      'دور المجموعات: كل فريق يواجه باقي فرق مجموعته مرة واحدة',
      'الأدوار الإقصائية: أفضل فريقين من كل مجموعة يتأهلان (ربع النهائي ← نصف النهائي ← النهائي)',
    ],
  },
  {
    num: '٢', icon: '📊', title: 'نظام النقاط والترتيب',
    color: 'from-emerald-500 to-teal-600',
    points: true,
    items: [
      'عند تساوي النقاط: فارق الأهداف ← الأهداف المسجلة ← المواجهة المباشرة',
      'في حال التعادل التام يُلجأ إلى القرعة بحضور ممثلي الفريقين',
    ],
  },
  {
    num: '٣', icon: '⚽', title: 'قواعد المباريات',
    color: 'from-green-500 to-emerald-600',
    items: [
      'مدة المباراة: شوطان × ٢٠ دقيقة مع استراحة ٥ دقائق',
      'في الأدوار الإقصائية عند التعادل: وقت إضافي ٢ × ٥ دقائق ثم ركلات الترجيح',
      'تبديلات غير محدودة من قائمة الـ 4 احتياطيين — اللاعب المُبدَّل يمكنه العودة',
      'الكرة الرسمية للبطولة: #شابكة',
    ],
  },
  {
    num: '٤', icon: '📋', title: 'شروط اللاعبين والتسجيل',
    color: 'from-violet-500 to-purple-600',
    items: [
      'يجب تسليم قائمة اللاعبين كاملة قبل انطلاق أولى مباريات الفريق',
      'لا يُسمح بأي إضافة أو تعديل في القائمة بعد انطلاق البطولة إلا بإذن الإدارة',
      'لاعب مسجل في فريق لا يحق له اللعب مع فريق آخر في نفس البطولة',
      'اكتشاف لاعب غير مسجل = فوز للفريق المنافس + عقوبة على الفريق المخالف',
    ],
  },
  {
    num: '٥', icon: '⏱️', title: 'الغياب والتأخر',
    color: 'from-orange-500 to-amber-600',
    items: [
      'مهلة الانتظار: ١٠ دقائق فقط من الموعد المحدد',
      'التأخر أكثر من ١٠ دقائق = خسارة بالتغيب (٣–٠) والنقاط لصالح الخصم',
      'الغياب مرتين = استبعاد من البطولة دون استرداد رسوم التسجيل',
      'الحد الأدنى للمشاركة: ٥ لاعبين — وإلا تُعتبر المباراة خسارة بالتغيب',
    ],
  },
  {
    num: '٦', icon: '🟥', title: 'الانضباط والعقوبات',
    color: 'from-red-500 to-rose-600',
    table: true,
    rows: [
      { v: 'بطاقة حمراء مباشرة',                    p: 'إيقاف المباراة التالية + غرامة محتملة',  sev: 'high' },
      { v: 'بطاقتان صفراوان في المباراة',           p: 'طرد فوري = مباراة إيقاف',               sev: 'high' },
      { v: 'بطاقتان صفراوان تراكميتان في البطولة', p: 'إيقاف مباراة واحدة',                    sev: 'med'  },
      { v: 'ثلاث بطاقات صفراء تراكمية',            p: 'إيقاف مبارتين',                         sev: 'med'  },
      { v: 'التعدي على الحكم أو إهانته',            p: 'إيقاف فوري + استبعاد محتمل',           sev: 'crit' },
      { v: 'الشغب وإثارة الفوضى',                  p: 'استبعاد الفريق بأكمله',                  sev: 'crit' },
      { v: 'لاعب غير مسجل',                        p: 'خسارة المباراة ٠–٣ + غرامة',             sev: 'high' },
    ],
  },
  {
    num: '٧', icon: '🎽', title: 'اللباس والمعدات',
    color: 'from-cyan-500 to-sky-600',
    items: [
      'اللباس الموحد (قميص + شورت + جوارب) إجباري لجميع اللاعبين المشاركين',
      'في حال تشابه الألوان: الفريق الضيف يغيّر لباسه',
      'القمصان تحمل أرقاماً ثابتة متطابقة مع قائمة التسجيل',
      'حارس المرمى يرتدي لباساً مختلف اللون عن لاعبيه وعن خصومه',
    ],
  },
  {
    num: '٨', icon: '⚖️', title: 'الاحتجاجات والطعون',
    color: 'from-slate-500 to-gray-600',
    items: [
      'احتجاج رسمي كتابي مقبول خلال ٢٤ ساعة من نهاية المباراة',
      'يُرفق الاحتجاج بتأمين قدره ١ 000 دج — يُسترد إن قُبل الاحتجاج',
      'لجنة الانضباط تبت خلال ٤٨ ساعة وقراراتها نهائية',
      'قرارات التحكيم الميدانية لا تقبل الطعن',
    ],
  },
  {
    num: '٩', icon: '🏆', title: 'الجوائز والتتويج',
    color: 'from-yellow-500 to-amber-500',
    awards: true,
  },
  {
    num: '١٠', icon: '📌', title: 'أحكام عامة',
    color: 'from-pink-500 to-rose-500',
    items: [
      'تحتفظ الإدارة بحق تعديل أي بند من هذا القانون مع إشعار الفرق المعنية',
      'كل حالة غير منصوص عليها تبت فيها لجنة التنظيم وقرارها نهائي',
      'المشاركة في البطولة تعني القبول الكامل بجميع بنود هذا القانون',
    ],
  },
];

const SEV_STYLE = {
  crit: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  med:  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
};

function ArticleCard({ article, open, onToggle }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 text-right bg-white dark:bg-[#111827] hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <span className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${article.color} flex items-center justify-center text-white font-black text-sm shadow-sm`}>
          {article.num}
        </span>
        <span className="flex-1 font-bold text-base text-gray-900 dark:text-gray-100">{article.icon} {article.title}</span>
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Body */}
      {open && (
        <div className="px-5 pb-5 pt-2 bg-gray-50/60 dark:bg-gray-900/40 text-sm leading-relaxed" dir="rtl">

          {/* Points mini-grid */}
          {article.points && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {[
                { label: 'فوز',    pts: '3',  bg: 'bg-green-500',  shadow: 'shadow-green-200 dark:shadow-green-900' },
                { label: 'تعادل', pts: '1',  bg: 'bg-amber-500',  shadow: 'shadow-amber-200 dark:shadow-amber-900' },
                { label: 'خسارة', pts: '0',  bg: 'bg-red-500',    shadow: 'shadow-red-200 dark:shadow-red-900' },
              ].map(r => (
                <div key={r.label} className={`${r.bg} ${r.shadow} shadow-md rounded-xl p-3 text-center text-white`}>
                  <p className="font-black text-2xl leading-none">{r.pts}</p>
                  <p className="text-xs mt-1 opacity-90 font-semibold">{r.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Discipline table */}
          {article.table && (
            <div className="rounded-xl overflow-hidden border border-border-light dark:border-border-dark mb-2">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="text-right px-4 py-2.5 font-bold text-gray-700 dark:text-gray-300">المخالفة</th>
                    <th className="text-right px-4 py-2.5 font-bold text-gray-700 dark:text-gray-300">العقوبة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {article.rows.map((row, i) => (
                    <tr key={i} className="bg-white dark:bg-[#111827] hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{row.v}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-semibold ${SEV_STYLE[row.sev]}`}>
                          {row.p}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Awards */}
          {article.awards && (
            <div className="space-y-2 mb-2">
              {[
                { icon: '🥇', label: 'البطل',    desc: 'كأس البطولة + ميداليات + جائزة مالية' },
                { icon: '🥈', label: 'الوصيف',   desc: 'ميداليات + جائزة مالية' },
                { icon: '🥉', label: 'الثالث',   desc: 'ميداليات + جائزة مالية' },
                { icon: '🏅', label: 'الهداف',   desc: 'جائزة أفضل هداف في البطولة' },
                { icon: '⭐', label: 'أفضل لاعب', desc: 'جائزة أفضل لاعب في البطولة' },
                { icon: '🧤', label: 'أفضل حارس', desc: 'جائزة أفضل حارس مرمى' },
                { icon: '🤝', label: 'روح الرياضة', desc: 'جائزة الفريق الأكثر نبلاً وانضباطاً' },
              ].map(a => (
                <div key={a.label} className="flex items-center gap-3 bg-white dark:bg-[#111827] rounded-xl px-4 py-2.5 border border-border-light dark:border-border-dark">
                  <span className="text-2xl shrink-0">{a.icon}</span>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-gray-100 text-xs">{a.label}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">{a.desc}</p>
                  </div>
                </div>
              ))}
              <p className="text-xs text-gray-400 italic pt-1 pr-1">* قيم الجوائز المالية تُعلَن رسمياً قبيل انطلاق البطولة</p>
            </div>
          )}

          {/* Regular bullet list */}
          {article.items && (
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              {article.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function Terms() {
  const { t } = useTranslation();
  const [openArticle, setOpenArticle] = useState(null);

  function toggle(num) {
    setOpenArticle(prev => prev === num ? null : num);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" dir="rtl">

      {/* Back */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors mb-6 group">
        <svg className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {t('nav.home')}
      </Link>

      {/* ── HERO ── */}
      <div className="relative rounded-3xl overflow-hidden mb-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-xl">
        {/* decorative rings */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

        <div className="relative px-8 py-10 text-center text-white">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg mb-5 text-4xl">
            🏆
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black mb-1 tracking-tight">مونديال لمطار 2026</h1>
          <p className="text-primary font-bold text-base mb-1">#مونديال_لمطار_2026</p>
          <p className="text-gray-400 text-sm italic mb-6">From us to all – Creativity sans limite</p>

          {/* Tribute banner */}
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-2xl px-5 py-2.5 text-amber-300 text-sm">
            <span className="text-xl">🦅</span>
            <span>طبعة الوفاء — إلى روح الشهيد الطيار <strong className="text-amber-200">بن نجة يوسف</strong></span>
          </div>
        </div>
      </div>

      {/* ── QUICK STATS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { icon: '📍', label: 'الملعب',          value: 'الملعب البلدي — لمطار',  gradient: 'from-blue-500/10 to-indigo-500/10',   border: 'border-blue-200  dark:border-blue-900' },
          { icon: '💰', label: 'رسوم التسجيل',    value: '8 000 دج / فريق',        gradient: 'from-green-500/10 to-emerald-500/10', border: 'border-green-200 dark:border-green-900' },
          { icon: '👥', label: 'التشكيلة',        value: '6 + 4 احتياط',           gradient: 'from-violet-500/10 to-purple-500/10', border: 'border-violet-200 dark:border-violet-900' },
          { icon: '🎽', label: 'اللباس',          value: 'موحد إجباري',            gradient: 'from-orange-500/10 to-amber-500/10',  border: 'border-orange-200 dark:border-orange-900' },
        ].map(item => (
          <div key={item.label} className={`bg-gradient-to-br ${item.gradient} border ${item.border} rounded-2xl p-4 text-center`}>
            <p className="text-3xl mb-2">{item.icon}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{item.label}</p>
            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">{item.value}</p>
          </div>
        ))}
      </div>

      {/* ── BASIC LAW ── */}
      <div className="mb-8">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gradient-to-r from-primary/40 to-transparent" />
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-lg">📜</span>
            <span className="font-display font-black text-sm text-primary tracking-wide">القانون الأساسي للدورة</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-primary/40 to-transparent" />
        </div>

        <div className="space-y-3">
          {ARTICLES.map(article => (
            <ArticleCard
              key={article.num}
              article={article}
              open={openArticle === article.num}
              onToggle={() => toggle(article.num)}
            />
          ))}
        </div>
      </div>

      {/* ── MEDIA & REFEREEING ── */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#111827] p-5 space-y-3">
          <p className="font-display font-bold text-base flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm">🎙️</span>
            التغطية الإعلامية
          </p>
          {[
            'تغطية إعلامية وتصوير لجميع المباريات 📸',
            'منصة إلكترونية للنتائج والترتيب لحظة بلحظة 📊',
            'مفاجآت ستُكشف قريباً 🎁',
          ].map((t, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
              <span>{t}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#111827] p-5 space-y-3">
          <p className="font-display font-bold text-base flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white text-sm">🟡</span>
            التحكيم
          </p>
          {[
            'طاقم فيدرالي ذو خبرة في البطولات الوطنية',
            'تقنية VAR لضمان حق كل فريق ✅',
            'قرارات الحكام نهائية وغير قابلة للاستئناف',
          ].map((t, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
              <span>{t}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CONTACT ── */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gradient-to-r from-green-400/40 to-transparent" />
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/20">
            <span className="text-lg">📞</span>
            <span className="font-display font-black text-sm text-green-600 dark:text-green-400 tracking-wide">التواصل والتسجيل</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-green-400/40 to-transparent" />
        </div>

        <div className="space-y-3">
          {CONTACTS.map((c, i) => (
            <div key={c.phone} className="flex items-center gap-4 bg-white dark:bg-[#111827] border border-border-light dark:border-border-dark rounded-2xl px-5 py-4 hover:border-primary/30 hover:shadow-sm transition-all">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-base text-white shadow-sm shrink-0 ${
                i === 0 ? 'bg-gradient-to-br from-primary to-green-600'
                : i === 1 ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                : 'bg-gradient-to-br from-orange-500 to-amber-600'
              }`}>
                {c.name[0]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{c.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{c.role}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {c.whatsapp && (
                  <span className="inline-flex items-center gap-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-lg font-semibold">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />WA
                  </span>
                )}
                {c.telegram && (
                  <span className="inline-flex items-center gap-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-lg font-semibold">
                    <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />TG
                  </span>
                )}
                <a
                  href={`tel:${c.phone}`}
                  className="font-mono text-sm font-bold text-primary hover:underline bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-xl transition-colors"
                >
                  {c.phone}
                </a>
              </div>
            </div>
          ))}

          {/* Email + Social */}
          <div className="grid sm:grid-cols-2 gap-3 mt-2">
            <a
              href="mailto:mundiallamtar.contact@gmail.com"
              className="flex items-center gap-3 bg-white dark:bg-[#111827] border border-border-light dark:border-border-dark rounded-2xl px-5 py-4 hover:border-primary/30 hover:shadow-sm transition-all group"
            >
              <span className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center text-xl shrink-0">📩</span>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">البريد الإلكتروني</p>
                <p className="text-xs font-semibold text-primary truncate group-hover:underline">mundiallamtar.contact@gmail.com</p>
              </div>
            </a>
            <div className="flex items-center gap-3 bg-white dark:bg-[#111827] border border-border-light dark:border-border-dark rounded-2xl px-5 py-4">
              <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-violet-500 text-white flex items-center justify-center text-xl shrink-0">📱</span>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Facebook / Instagram / TikTok</p>
                <p className="font-bold text-sm text-primary">@Mundial22024</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── IDENTITY ── */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-200 dark:border-orange-900 p-5 text-center">
          <p className="text-4xl mb-2">🦊</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-widest font-semibold">التميمة الرسمية</p>
          <p className="font-display font-black text-lg text-orange-600 dark:text-orange-400">#الكابتن</p>
        </div>
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-200 dark:border-green-900 p-5 text-center">
          <p className="text-4xl mb-2">⚽</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-widest font-semibold">الكرة الرسمية</p>
          <p className="font-display font-black text-lg text-green-600 dark:text-green-400">#شابكة</p>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-green-600 to-emerald-700 p-8 text-center text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_60%)] pointer-events-none" />
        <p className="text-3xl mb-3">🚀</p>
        <h2 className="font-display font-black text-2xl mb-1">هل فريقكم مستعد؟</h2>
        <p className="text-white/80 text-sm mb-6">سجّلوا الآن واكتبوا اسمكم في تاريخ البطولة</p>
        <Link
          to="/register"
          className="inline-block bg-white text-primary font-bold text-sm px-8 py-3 rounded-2xl hover:bg-gray-50 transition-colors shadow-md hover:shadow-lg"
        >
          سجّل فريقك الآن ←
        </Link>
      </div>

    </div>
  );
}
