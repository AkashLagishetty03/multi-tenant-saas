import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { Bell, LogOut, Sun, Moon } from 'lucide-react'
import { StatusBadge } from '../ui/StatusBadge'

export function TopBar() {
  const { user, logout } = useAuth()
  const { mode, toggleMode } = useTheme()
  
  const initials = user?.name
    ?.split(/\s+/)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-surface-200 bg-card/80 px-6 py-3 shadow-sm backdrop-blur-md sticky top-0 z-10">
      
      {/* Left side (Breadcrumbs / Greeting) */}
      <div className="flex items-center gap-2 text-sm text-ink-500 font-medium">
        <span>Workspace</span>
        <span className="text-surface-300">/</span>
        <span className="text-ink-900">Dashboard</span>
      </div>

      {/* Right side (Profile, Notifications, Logout) */}
      <div className="flex items-center gap-4">
        
        {/* Light/Dark Mode Toggle */}
        <button
          onClick={toggleMode}
          className="relative flex h-8 w-14 items-center rounded-full bg-surface-100 p-1 transition-colors hover:bg-surface-200 border border-surface-200"
          title={mode === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
        >
          <div
            className={`
              flex h-6 w-6 items-center justify-center rounded-full bg-card shadow-sm transition-transform duration-300 z-10
              ${mode === 'dark' ? 'translate-x-6' : 'translate-x-0'}
            `}
          >
            {mode === 'light' ? (
              <Sun className="h-4 w-4 text-amber-500 fill-amber-50" />
            ) : (
              <Moon className="h-4 w-4 text-indigo-400 fill-indigo-400" />
            )}
          </div>
          <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
            <Sun className={`h-3.5 w-3.5 transition-opacity ${mode === 'light' ? 'opacity-0' : 'text-ink-400'}`} />
            <Moon className={`h-3.5 w-3.5 transition-opacity ${mode === 'dark' ? 'opacity-0' : 'text-ink-400'}`} />
          </div>
        </button>

        <div className="h-6 w-px bg-surface-200" />
        
        <button className="relative p-2 text-ink-500 rounded-lg hover:bg-surface-100 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        <div className="h-6 w-px bg-surface-200" />

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-ink-900 leading-none mb-1">{user?.name ?? 'User'}</span>
            <div className="flex items-center gap-2">
              <StatusBadge role={user?.role} />
            </div>
          </div>
          
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-100 border border-surface-200 text-sm font-medium text-ink-700 cursor-pointer hover:bg-surface-200 transition-colors">
            {initials}
          </div>
        </div>

        <div className="h-6 w-px bg-surface-200" />

        <button
          onClick={logout}
          className="p-2 text-ink-500 rounded-lg hover:bg-surface-100 hover:text-red-600 transition-colors"
          title="Log out"
        >
          <LogOut className="w-5 h-5" />
        </button>

      </div>
    </header>
  )
}
