import React from 'react'
import { Card } from './Card'

export function StatCard({ title, value, icon: Icon, trend, trendLabel, className = '' }) {
  return (
    <Card className={`flex flex-col ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-ink-500">{title}</h3>
        {Icon && (
          <div className="p-2 bg-surface-100 rounded-lg">
            <Icon className="w-5 h-5 text-ink-700" />
          </div>
        )}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-ink-900">{value}</span>
        {trend && (
          <span className={`text-xs font-medium ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-600' : 'text-ink-500'}`}>
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : ''} {trendLabel}
          </span>
        )}
      </div>
    </Card>
  )
}
