import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

const CONTACTS = [
  { name: 'حماني أيوب',  role: 'رئاسة مشتركة — اللجنة المنظمة', phone: '0670062056', whatsapp: true,  telegram: true },
  { name: 'عبادة محمد',  role: 'رئاسة مشتركة — اللجنة المنظمة', phone: '0665181513', whatsapp: true,  telegram: true },
];

const CHAPTERS = [
  {
    id: 'ch1', icon: '👥', gradient: 'from-blue-600 to-indigo-700', titleKey: 'terms.ch1_title',
    articles: [
      { num: '١', icon: '🏗️', titleKey: 'terms.ch1_art1_title', color: 'from-blue-500 to-indigo-600',
        itemKeys: ['terms.ch1_art1_item0', 'terms.ch1_art1_item1'] },
      { num: '٢', icon: '🎂', titleKey: 'terms.ch1_art2_title', color: 'from-sky-500 to-blue-600',
        itemKeys: ['terms.ch1_art2_item0', 'terms.ch1_art2_item1', 'terms.ch1_art2_item2'] },
      { num: '٣', icon: '📌', titleKey: 'terms.ch1_art3_title', color: 'from-indigo-500 to-violet-600',
        itemKeys: ['terms.ch1_art3_item0', 'terms.ch1_art3_item1'] },
      { num: '٤', icon: '🔄', titleKey: 'terms.ch1_art4_title', color: 'from-violet-500 to-purple-600',
        itemKeys: ['terms.ch1_art4_item0', 'terms.ch1_art4_item1', 'terms.ch1_art4_item2'] },
      { num: '٥', icon: '🎽', titleKey: 'terms.ch1_art5_title', color: 'from-cyan-500 to-sky-600',
        itemKeys: ['terms.ch1_art5_item0', 'terms.ch1_art5_item1', 'terms.ch1_art5_item2'] },
      { num: '٦', icon: '📱', titleKey: 'terms.ch1_art6_title', color: 'from-teal-500 to-emerald-600',
        itemKeys: ['terms.ch1_art6_item0', 'terms.ch1_art6_item1', 'terms.ch1_art6_item2'] },
    ],
  },
  {
    id: 'ch2', icon: '⚽', gradient: 'from-green-600 to-emerald-700', titleKey: 'terms.ch2_title',
    articles: [
      { num: '٧',  icon: '⏱️', titleKey: 'terms.ch2_art1_title', color: 'from-green-500 to-emerald-600',
        itemKeys: ['terms.ch2_art1_item0', 'terms.ch2_art1_item1'] },
      { num: '٨',  icon: '🔢', titleKey: 'terms.ch2_art2_title', color: 'from-emerald-500 to-teal-600',
        itemKeys: ['terms.ch2_art2_item0'] },
      { num: '٩',  icon: '🔁', titleKey: 'terms.ch2_art3_title', color: 'from-teal-500 to-cyan-600',
        itemKeys: ['terms.ch2_art3_item0', 'terms.ch2_art3_item1'] },
      { num: '١٠', icon: '🧤', titleKey: 'terms.ch2_art4_title', color: 'from-cyan-500 to-blue-600',
        itemKeys: ['terms.ch2_art4_item0', 'terms.ch2_art4_item1'] },
      { num: '١١', icon: '🚧', titleKey: 'terms.ch2_art5_title', color: 'from-blue-500 to-indigo-600',
        itemKeys: ['terms.ch2_art5_item0', 'terms.ch2_art5_item1'] },
      { num: '١٢', icon: '📅', titleKey: 'terms.ch2_art6_title', color: 'from-indigo-500 to-violet-600',
        itemKeys: ['terms.ch2_art6_item0', 'terms.ch2_art6_item1'] },
    ],
  },
  {
    id: 'ch3', icon: '🟥', gradient: 'from-red-600 to-rose-700', titleKey: 'terms.ch3_title',
    articles: [
      { num: '١٣', icon: '💰', titleKey: 'terms.ch3_art1_title', color: 'from-red-500 to-rose-600',
        table: true,
        rowKeys: [
          { vKey: 'terms.ch3_art1_row0_v', pKey: 'terms.ch3_art1_row0_p', sev: 'med'  },
          { vKey: 'terms.ch3_art1_row1_v', pKey: 'terms.ch3_art1_row1_p', sev: 'high' },
          { vKey: 'terms.ch3_art1_row2_v', pKey: 'terms.ch3_art1_row2_p', sev: 'high' },
        ],
        itemKeys: ['terms.ch3_art1_item0', 'terms.ch3_art1_item1'] },
      { num: '١٤', icon: '🔒', titleKey: 'terms.ch3_art2_title', color: 'from-rose-500 to-pink-600',
        itemKeys: ['terms.ch3_art2_item0'] },
      { num: '١٥', icon: '🚫', titleKey: 'terms.ch3_art3_title', color: 'from-orange-500 to-red-600',
        itemKeys: ['terms.ch3_art3_item0', 'terms.ch3_art3_item1'] },
      { num: '١٦', icon: '⬜', titleKey: 'terms.ch3_art4_title', color: 'from-slate-400 to-gray-600',
        itemKeys: ['terms.ch3_art4_item0', 'terms.ch3_art4_item1'] },
      { num: '١٧', icon: '🛡️', titleKey: 'terms.ch3_art5_title', color: 'from-amber-500 to-orange-600',
        itemKeys: ['terms.ch3_art5_item0', 'terms.ch3_art5_item1'] },
      { num: '١٨', icon: '🤝', titleKey: 'terms.ch3_art6_title', color: 'from-red-600 to-rose-700',
        itemKeys: ['terms.ch3_art6_item0', 'terms.ch3_art6_item1'] },
    ],
  },
  {
    id: 'ch4', icon: '⚖️', gradient: 'from-violet-600 to-purple-700', titleKey: 'terms.ch4_title',
    articles: [
      { num: '١٩', icon: '💻', titleKey: 'terms.ch4_art1_title', color: 'from-violet-500 to-purple-600',
        itemKeys: ['terms.ch4_art1_item0'] },
      { num: '٢٠', icon: '🟡', titleKey: 'terms.ch4_art2_title', color: 'from-purple-500 to-fuchsia-600',
        itemKeys: ['terms.ch4_art2_item0', 'terms.ch4_art2_item1'] },
      { num: '٢١', icon: '📋', titleKey: 'terms.ch4_art3_title', color: 'from-fuchsia-500 to-pink-600',
        itemKeys: ['terms.ch4_art3_item0', 'terms.ch4_art3_item1', 'terms.ch4_art3_item2'] },
    ],
  },
  {
    id: 'ch5', icon: '🦅', gradient: 'from-amber-600 to-orange-700', titleKey: 'terms.ch5_title',
    articles: [
      { num: '٢٢', icon: '🕊️', titleKey: 'terms.ch5_art1_title', color: 'from-amber-500 to-yellow-600',
        itemKeys: ['terms.ch5_art1_item0', 'terms.ch5_art1_item1'] },
      { num: '٢٣', icon: '🏘️', titleKey: 'terms.ch5_art2_title', color: 'from-orange-500 to-amber-600',
        itemKeys: ['terms.ch5_art2_item0'] },
      { num: '٢٤', icon: '👑', titleKey: 'terms.ch5_art3_title', color: 'from-yellow-500 to-orange-500',
        itemKeys: ['terms.ch5_art3_item0'] },
      { num: '٢٥', icon: '✍️', titleKey: 'terms.ch5_art4_title', color: 'from-orange-600 to-red-600',
        itemKeys: ['terms.ch5_art4_item0'] },
      { num: '٢٦', icon: '📜', titleKey: 'terms.ch5_art5_title', color: 'from-red-600 to-rose-700',
        itemKeys: ['terms.ch5_art5_item0'] },
    ],
  },
];

const COMMITTEES = [
  { num: '1', icon: '📋', color: 'from-blue-500 to-indigo-600',
    titleKey: 'terms.committee1_title', membersKey: 'terms.committee1_members',
    taskKeys: ['terms.committee1_task0','terms.committee1_task1','terms.committee1_task2','terms.committee1_task3'] },
  { num: '2', icon: '🏟️', color: 'from-green-500 to-emerald-600',
    titleKey: 'terms.committee2_title', membersKey: 'terms.committee2_members',
    taskKeys: ['terms.committee2_task0','terms.committee2_task1','terms.committee2_task2'] },
  { num: '3', icon: '⚖️', color: 'from-yellow-500 to-orange-600',
    titleKey: 'terms.committee3_title', membersKey: 'terms.committee3_members',
    taskKeys: ['terms.committee3_task0','terms.committee3_task1','terms.committee3_task2','terms.committee3_task3'] },
  { num: '4', icon: '💻', color: 'from-violet-500 to-purple-600',
    titleKey: 'terms.committee4_title', membersKey: 'terms.committee4_members',
    taskKeys: ['terms.committee4_task0','terms.committee4_task1','terms.committee4_task2'] },
  { num: '5', icon: '📸', color: 'from-pink-500 to-rose-600',
    titleKey: 'terms.committee5_title', membersKey: 'terms.committee5_members',
    taskKeys: ['terms.committee5_task0','terms.committee5_task1','terms.committee5_task2'] },
];

const SEV_STYLE = {
  crit: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  med:  'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
};

function ArticleCard({ article, open, onToggle }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  return (
    <div className="rounded-2xl overflow-hidden border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 text-right bg-white dark:bg-[#111827] hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <span className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${article.color} flex items-center justify-center text-white font-black text-sm shadow-sm`}>
          {article.num}
        </span>
        <span className="flex-1 font-bold text-base text-gray-900 dark:text-gray-100">{article.icon} {t(article.titleKey)}</span>
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className={`px-5 pb-5 pt-2 bg-gray-50/60 dark:bg-gray-900/40 text-sm leading-relaxed ${isRtl ? 'dir-rtl' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
          {article.table && (
            <div className="rounded-xl overflow-hidden border border-border-light dark:border-border-dark mb-3">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-100 dark:bg-gray-800">
                    <th className="text-right px-4 py-2.5 font-bold text-gray-700 dark:text-gray-300">{t('terms.table_violation')}</th>
                    <th className="text-right px-4 py-2.5 font-bold text-gray-700 dark:text-gray-300">{t('terms.table_penalty')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-light dark:divide-border-dark">
                  {article.rowKeys.map((row, i) => (
                    <tr key={i} className="bg-white dark:bg-[#111827] hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-2.5 text-gray-600 dark:text-gray-400">{t(row.vKey)}</td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-block px-2 py-0.5 rounded-lg text-xs font-semibold ${SEV_STYLE[row.sev]}`}>
                          {t(row.pKey)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {article.itemKeys && (
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              {article.itemKeys.map((key, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

function ChapterHeader({ chapter }) {
  const { t } = useTranslation();
  return (
    <div className={`flex items-center gap-3 bg-gradient-to-r ${chapter.gradient} rounded-2xl px-5 py-3.5 text-white shadow-md mb-3`}>
      <span className="text-2xl">{chapter.icon}</span>
      <span className="font-display font-black text-sm tracking-wide">{t(chapter.titleKey)}</span>
    </div>
  );
}

function CommitteeCard({ committee }) {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl overflow-hidden border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-4 px-5 py-4 text-right bg-white dark:bg-[#111827] hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <span className={`shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${committee.color} flex items-center justify-center text-white font-black text-sm shadow-sm`}>
          {committee.num}
        </span>
        <div className="flex-1 text-right">
          <p className="font-bold text-base text-gray-900 dark:text-gray-100">{committee.icon} {t(committee.titleKey)}</p>
          <p className="text-xs text-gray-400">{t(committee.membersKey)}</p>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-2 bg-gray-50/60 dark:bg-gray-900/40 text-sm leading-relaxed" dir={isRtl ? 'rtl' : 'ltr'}>
          <ul className="space-y-2 text-gray-600 dark:text-gray-400">
            {committee.taskKeys.map((key, i) => (
              <li key={i} className="flex items-start gap-2.5">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function Terms() {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const [openArticle, setOpenArticle] = useState(null);

  function toggle(num) {
    setOpenArticle(prev => prev === num ? null : num);
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8" dir={isRtl ? 'rtl' : 'ltr'}>

      {/* Back */}
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-primary transition-colors mb-6 group">
        <svg className="w-4 h-4 rotate-180 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {t('nav.home')}
      </Link>

      {/* ── HERO ── */}
      <div className="relative rounded-3xl overflow-hidden mb-6 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-xl">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

        <div className="relative px-8 py-10 text-center text-white">
          <img src="/logo.png" alt="Mundial Lamtar 2026" className="w-20 h-20 rounded-2xl object-cover mx-auto mb-5 shadow-lg" />
          <h1 className="font-display text-3xl sm:text-4xl font-black mb-1 tracking-tight">مونديال لمطار 2026</h1>
          <p className="text-primary font-bold text-base mb-1">#مونديال_لمطار_2026</p>
          <p className="text-gray-400 text-sm italic mb-6">{t('terms.subtitle')}</p>

          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-2xl px-5 py-2.5 text-amber-300 text-sm">
            <span className="text-xl">🦅</span>
            <span>{t('terms.tribute')}</span>
          </div>
        </div>
      </div>

      {/* ── QUICK STATS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { icon: '📍', labelKey: 'terms.stat_venue_label',    valueKey: 'terms.stat_venue_value',    gradient: 'from-blue-500/10 to-indigo-500/10',   border: 'border-blue-200  dark:border-blue-900' },
          { icon: '💰', labelKey: 'terms.stat_fee_label',      valueKey: 'terms.stat_fee_value',      gradient: 'from-green-500/10 to-emerald-500/10', border: 'border-green-200 dark:border-green-900' },
          { icon: '⏱️', labelKey: 'terms.stat_duration_label', valueKey: 'terms.stat_duration_value', gradient: 'from-orange-500/10 to-amber-500/10',  border: 'border-orange-200 dark:border-orange-900' },
          { icon: '👥', labelKey: 'terms.stat_squad_label',    valueKey: 'terms.stat_squad_value',    gradient: 'from-violet-500/10 to-purple-500/10', border: 'border-violet-200 dark:border-violet-900' },
        ].map(item => (
          <div key={item.labelKey} className={`bg-gradient-to-br ${item.gradient} border ${item.border} rounded-2xl p-4 text-center`}>
            <p className="text-3xl mb-2">{item.icon}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{t(item.labelKey)}</p>
            <p className="text-xs font-bold text-gray-800 dark:text-gray-200 leading-tight">{t(item.valueKey)}</p>
          </div>
        ))}
      </div>

      {/* ── CONSTITUTION (26 articles) ── */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gradient-to-r from-primary/40 to-transparent" />
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-lg">📜</span>
            <span className="font-display font-black text-sm text-primary tracking-wide">{t('terms.constitution_title')}</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-primary/40 to-transparent" />
        </div>

        <div className="space-y-6">
          {CHAPTERS.map(chapter => (
            <div key={chapter.id}>
              <ChapterHeader chapter={chapter} />
              <div className="space-y-2 mr-1">
                {chapter.articles.map(article => (
                  <ArticleCard
                    key={article.num}
                    article={article}
                    open={openArticle === article.num}
                    onToggle={() => toggle(article.num)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ORGANIZATIONAL STRUCTURE ── */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gradient-to-r from-violet-400/40 to-transparent" />
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/20">
            <span className="text-lg">🏛️</span>
            <span className="font-display font-black text-sm text-violet-600 dark:text-violet-400 tracking-wide">{t('terms.org_title')}</span>
          </div>
          <div className="flex-1 h-px bg-gradient-to-l from-violet-400/40 to-transparent" />
        </div>

        {/* Presidency */}
        <div className="rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-amber-500/30 p-5 mb-4 text-center text-white shadow-lg">
          <p className="text-2xl mb-2">👑</p>
          <p className="font-display font-black text-base mb-1 text-amber-300">{t('terms.presidency_title')}</p>
          <p className="text-sm text-gray-300 mb-3">{t('terms.presidency_names')}</p>
          <div className="flex flex-wrap justify-center gap-2 text-xs">
            {[0,1,2,3,4].map(i => (
              <span key={i} className="bg-amber-500/20 border border-amber-500/30 text-amber-300 px-3 py-1 rounded-full">
                {t(`terms.presidency_role${i}`)}
              </span>
            ))}
          </div>
        </div>

        {/* Golden rules */}
        <div className="rounded-2xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-5 mb-4">
          <p className="font-bold text-sm text-amber-700 dark:text-amber-400 mb-3 flex items-center gap-2">
            {t('terms.golden_rules_title')}
          </p>
          <ul className="space-y-2 text-xs text-amber-800 dark:text-amber-300">
            {[0,1,2,3].map((i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="font-black text-amber-600 dark:text-amber-400 shrink-0">{i + 1}.</span>
                <span>{t(`terms.golden_rule${i}`)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 5 committees */}
        <p className="text-xs text-gray-400 text-center mb-3">{t('terms.committees_title')}</p>
        <div className="space-y-2">
          {COMMITTEES.map(c => (
            <CommitteeCard key={c.num} committee={c} />
          ))}
        </div>
      </div>

   

      {/* ── MEDIA & REFEREEING ── */}
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        <div className="rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#111827] p-5 space-y-3">
          <p className="font-display font-bold text-base flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm">🎙️</span>
            {t('terms.media_title')}
          </p>
          {[0,1,2].map(i => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0" />
              <span>{t(`terms.media_item${i}`)}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-border-light dark:border-border-dark bg-white dark:bg-[#111827] p-5 space-y-3">
          <p className="font-display font-bold text-base flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white text-sm">🟡</span>
            {t('terms.refereeing_title')}
          </p>
          {[0,1,2].map(i => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" />
              <span>{t(`terms.refereeing_item${i}`)}</span>
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
            <span className="font-display font-black text-sm text-green-600 dark:text-green-400 tracking-wide">{t('terms.contact_title')}</span>
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

          <div className="grid sm:grid-cols-2 gap-3 mt-2">
            <a
              href="mailto:mundiallamtar.contact@gmail.com"
              className="flex items-center gap-3 bg-white dark:bg-[#111827] border border-border-light dark:border-border-dark rounded-2xl px-5 py-4 hover:border-primary/30 hover:shadow-sm transition-all group"
            >
              <span className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center text-xl shrink-0">📩</span>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">{t('terms.email_label')}</p>
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
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-widest font-semibold">{t('terms.mascot_label')}</p>
          <p className="font-display font-black text-lg text-orange-600 dark:text-orange-400">#الكابتن</p>
        </div>
        <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-200 dark:border-green-900 p-5 text-center">
          <p className="text-4xl mb-2">⚽</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-widest font-semibold">{t('terms.ball_label')}</p>
          <p className="font-display font-black text-lg text-green-600 dark:text-green-400">#شابكة</p>
        </div>
      </div>

      {/* ── CTA ── */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary via-green-600 to-emerald-700 p-8 text-center text-white shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_60%)] pointer-events-none" />
        <p className="text-3xl mb-3">🚀</p>
        <h2 className="font-display font-black text-2xl mb-1">{t('terms.cta_title')}</h2>
        <p className="text-white/80 text-sm mb-6">{t('terms.cta_sub')}</p>
        <Link
          to="/register"
          className="inline-block bg-white text-primary font-bold text-sm px-8 py-3 rounded-2xl hover:bg-gray-50 transition-colors shadow-md hover:shadow-lg"
        >
          {t('terms.cta_btn')}
        </Link>
      </div>

    </div>
  );
}
