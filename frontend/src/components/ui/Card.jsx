import React from 'react'

export function Card({ children, className = '', noPadding = false }) {
  return (
    <div className={`bg-card rounded-xl shadow-card border border-surface-200 overflow-hidden ${className}`}>
      {!noPadding && <div className="p-6">{children}</div>}
      {noPadding && children}
    </div>
  )
}
