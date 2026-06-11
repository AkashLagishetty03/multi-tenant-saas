import React from 'react'
import { Layers } from 'lucide-react'

export function Logo({ size = 'md', className = '', showText = true }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  }

  const textClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  }

  const iconClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8'
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className={`flex shrink-0 items-center justify-center rounded-xl bg-[var(--accent-color)] text-white shadow-md ${sizeClasses[size]}`}>
        <Layers className={iconClasses[size]} />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold tracking-tight text-[var(--text-primary)] leading-none ${textClasses[size]}`}>
            SaaS<span className="text-[var(--accent-color)]">Core</span>
          </span>
        </div>
      )}
    </div>
  )
}
