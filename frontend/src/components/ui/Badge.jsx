const variants = {
  pending:      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved:     'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-400',
  rejected:     'bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-400',
  disqualified: 'bg-gray-100   text-gray-700   dark:bg-gray-700      dark:text-gray-300',
  live:         'bg-red-600    text-white animate-pulse',
  paid:         'bg-green-100  text-green-800  dark:bg-green-900/30  dark:text-green-400',
  unpaid:       'bg-red-100    text-red-800    dark:bg-red-900/30    dark:text-red-400',
  pending_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
};

export default function Badge({ variant = 'pending', children, className = '' }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${variants[variant] || variants.pending} ${className}`}>
      {children}
    </span>
  );
}
