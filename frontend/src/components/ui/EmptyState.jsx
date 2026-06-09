/**
 * EmptyState — reusable no-data placeholder
 *
 * Props:
 *   icon        string   emoji or short text shown in the icon box
 *   title       string   bold heading
 *   subtitle    string   muted description line
 *   action      node     optional CTA button / link
 *   size        'sm' | 'md' | 'lg'   (default 'md')
 *   iconBg      tailwind bg class for the icon box  (default auto from color)
 *   color       'green' | 'blue' | 'amber' | 'red' | 'gray'  (default 'gray')
 */
const COLOR_MAP = {
  green: {
    iconBg:   'bg-green-100  dark:bg-green-900/30',
    iconText: 'text-green-600 dark:text-green-400',
    dot:      'bg-green-400',
  },
  blue: {
    iconBg:   'bg-blue-100   dark:bg-blue-900/30',
    iconText: 'text-blue-600  dark:text-blue-400',
    dot:      'bg-blue-400',
  },
  amber: {
    iconBg:   'bg-amber-100  dark:bg-amber-900/30',
    iconText: 'text-amber-600 dark:text-amber-400',
    dot:      'bg-amber-400',
  },
  red: {
    iconBg:   'bg-red-100    dark:bg-red-900/30',
    iconText: 'text-red-600   dark:text-red-400',
    dot:      'bg-red-400',
  },
  gray: {
    iconBg:   'bg-gray-100   dark:bg-gray-800',
    iconText: 'text-gray-400  dark:text-gray-500',
    dot:      'bg-gray-400',
  },
};

const SIZE_MAP = {
  sm: { wrap: 'py-6',   box: 'w-12 h-12 text-2xl rounded-xl', title: 'text-sm font-bold', sub: 'text-xs' },
  md: { wrap: 'py-10',  box: 'w-16 h-16 text-3xl rounded-2xl', title: 'text-base font-bold', sub: 'text-sm' },
  lg: { wrap: 'py-16',  box: 'w-20 h-20 text-4xl rounded-2xl', title: 'text-xl font-black', sub: 'text-sm' },
};

export default function EmptyState({
  icon      = '📭',
  title     = 'Aucune donnée',
  subtitle  = '',
  action    = null,
  size      = 'md',
  color     = 'gray',
}) {
  const c = COLOR_MAP[color] || COLOR_MAP.gray;
  const s = SIZE_MAP[size]   || SIZE_MAP.md;

  return (
    <div className={`flex flex-col items-center justify-center gap-3 text-center ${s.wrap}`}>
      {/* Icon box */}
      <div className={`${s.box} ${c.iconBg} flex items-center justify-center leading-none shrink-0`}>
        <span>{icon}</span>
      </div>

      {/* Text */}
      <div className="space-y-1 max-w-[220px]">
        <p className={`${s.title} text-gray-800 dark:text-gray-200 leading-snug`}>{title}</p>
        {subtitle && (
          <p className={`${s.sub} text-gray-400 dark:text-gray-500 leading-relaxed`}>{subtitle}</p>
        )}
      </div>

      {/* Action */}
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
