import React from 'react'

export function Input({
  label,
  error,
  id,
  className = '',
  containerClassName = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-ink-800">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          w-full px-3 py-2 bg-card border rounded-lg shadow-sm text-sm placeholder-ink-400
          transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-surface-200'}
          disabled:bg-surface-50 disabled:text-ink-500 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  )
}
