import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, ChevronLeft, ChevronRight, Briefcase } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuth()

  const linkBase = "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 group relative"
  const inactive = "text-ink-500 hover:bg-surface-100 hover:text-ink-900"
  const active = "bg-primary-50 text-primary-700 shadow-sm"

  return (
    <aside 
      className={`relative flex flex-col border-r border-surface-200 bg-card transition-all duration-300 z-10 ${
        collapsed ? 'w-20' : 'w-64'
      } shrink-0`}
    >
      <div className="flex h-16 items-center justify-between border-b border-surface-200 px-4">
        <div className={`flex items-center gap-3 overflow-hidden ${collapsed ? 'justify-center w-full' : ''}`}>
          <div className="flex shrink-0 h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm">
            <Briefcase className="w-4 h-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink-900">Workspace</p>
              <p className="truncate text-xs text-ink-500">Multi-tenant</p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full border border-surface-200 bg-card text-ink-400 shadow-sm hover:text-ink-700 hover:bg-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500 z-20"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `${linkBase} ${isActive ? active : inactive} ${collapsed ? 'justify-center px-0' : ''}`}
          title={collapsed ? "Dashboard" : undefined}
        >
          <LayoutDashboard className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>
        
        {/* Only admins might have access to full tasks list, employees usually have their own dashboard but we'll show Tasks based on their role if needed. The original logic showed Tasks for everyone. Let's preserve that. */}
        <NavLink
          to="/tasks"
          className={({ isActive }) => `${linkBase} ${isActive ? active : inactive} ${collapsed ? 'justify-center px-0' : ''}`}
          title={collapsed ? "Tasks" : undefined}
        >
          <CheckSquare className="w-5 h-5 shrink-0" />
          {!collapsed && <span>Tasks</span>}
        </NavLink>
      </nav>

      {!collapsed && (
        <div className="p-4 m-3 mt-auto rounded-lg bg-surface-50 border border-surface-200">
          <p className="text-xs leading-relaxed text-ink-500">
            Organize work by team. Tasks stay scoped to your organization.
          </p>
        </div>
      )}
    </aside>
  )
}
