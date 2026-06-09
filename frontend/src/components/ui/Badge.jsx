const variants = {
  pending:        'bg-amber-100  text-amber-800  dark:bg-amber-900/30  dark:text-amber-400  border border-amber-200  dark:border-amber-800',
  approved:       'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-400  border border-green-200  dark:border-green-800',
  rejected:       'bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-400    border border-red-200    dark:border-red-900',
  disqualified:   'bg-gray-100   text-gray-700   dark:bg-gray-800      dark:text-gray-400   border border-gray-200   dark:border-gray-700',
  live:           'bg-red-600    text-white border-transparent',
  scheduled:      'bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-400   border border-blue-200   dark:border-blue-800',
  finished:       'bg-gray-100   text-gray-600   dark:bg-gray-800      dark:text-gray-400   border border-gray-200   dark:border-gray-700',
  paid:           'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-400  border border-green-200  dark:border-green-800',
  unpaid:         'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400    border border-red-200    dark:border-red-900',
  pending_review: 'bg-amber-100  text-amber-800  dark:bg-amber-900/30  dark:text-amber-400  border border-amber-200  dark:border-amber-800',
  validated:      'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-400  border border-green-200  dark:border-green-800',
  suspended:      'bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400    border border-red-200    dark:border-red-900',
  invited:        'bg-gray-100   text-gray-500   dark:bg-gray-800      dark:text-gray-400   border border-gray-200   dark:border-gray-700',
  group_stage:    'bg-blue-100   text-blue-800   dark:bg-blue-900/30   dark:text-blue-400   border border-blue-200   dark:border-blue-800',
  knockout:       'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800',
  registration:   'bg-amber-100  text-amber-800  dark:bg-amber-900/30  dark:text-amber-400  border border-amber-200  dark:border-amber-800',
};

export default function Badge({ variant = 'pending', children, className = '' }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${variants[variant] || variants.pending} ${className}`}>
      {children}
    </span>
  );
}
