import React from 'react'

export function StatusBadge({ status, role }) {
  // Common mappings for different entities (Tasks, Users, etc.)
  const mappings = {
    // Task statuses
    pending: { label: 'Pending', classes: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-500 dark:border-yellow-500/20' },
    in_progress: { label: 'In Progress', classes: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20' },
    completed: { label: 'Completed', classes: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20' },
    // User roles
    admin: { label: 'Admin', classes: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20' },
    employee: { label: 'Employee', classes: 'bg-surface-100 text-ink-700 border-surface-200 dark:bg-surface-800 dark:text-ink-400 dark:border-surface-700' },
  }

  // Fallback map
  const normalizedKey = status?.toLowerCase() || role?.toLowerCase() || ''
  const config = mappings[normalizedKey] || { label: status || role, classes: 'bg-surface-100 text-ink-700 border-surface-200' }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.classes}`}>
      {config.label}
    </span>
  )
}
