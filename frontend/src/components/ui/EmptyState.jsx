import React from 'react'

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-surface-200 border-dashed">
      {Icon && (
        <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-surface-100">
          <Icon className="w-6 h-6 text-ink-400" />
        </div>
      )}
      <h3 className="text-sm font-medium text-ink-900">{title}</h3>
      {description && <p className="mt-1 text-sm text-ink-500 max-w-sm">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  )
}
