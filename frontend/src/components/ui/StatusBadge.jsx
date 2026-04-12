const styles = {
  pending: 'bg-yellow-100 text-yellow-900 ring-yellow-300/80',
  'in-progress': 'bg-blue-100 text-blue-900 ring-blue-300/80',
  completed: 'bg-green-100 text-green-900 ring-green-300/80',
}

const labels = {
  pending: 'Pending',
  'in-progress': 'In progress',
  completed: 'Completed',
}

export function StatusBadge({ status }) {
  const className = styles[status] ?? styles.pending
  const label = labels[status] ?? status

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${className}`}
    >
      {label}
    </span>
  )
}
