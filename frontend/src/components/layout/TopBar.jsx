import { useAuth } from '../../context/AuthContext'

function RoleBadge({ role }) {
  const r = role?.toLowerCase()
  if (r === 'admin') {
    return (
      <span className="inline-flex shrink-0 rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-green-800 ring-1 ring-inset ring-green-200">
        Admin
      </span>
    )
  }
  if (r === 'employee') {
    return (
      <span className="inline-flex shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-blue-800 ring-1 ring-inset ring-blue-200/80">
        Employee
      </span>
    )
  }
  return (
    <span className="inline-flex shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-semibold capitalize text-blue-800 ring-1 ring-inset ring-blue-200">
      {role || 'Member'}
    </span>
  )
}

export function TopBar() {
  const { user, logout } = useAuth()
  const initials =
    user?.name
      ?.split(/\s+/)
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase() || '?'

  return (
    <header className="flex min-h-16 shrink-0 flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 bg-white/80 px-4 py-3 shadow-md backdrop-blur-md sm:px-6">
      <div className="min-w-0 flex-1 pr-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-medium text-slate-900">{user?.name ?? 'User'}</p>
          <RoleBadge role={user?.role} />
        </div>
        <p className="mt-0.5 truncate text-xs text-slate-500">{user?.email ?? '—'}</p>
      </div>
      <div className="flex shrink-0 items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-semibold text-white shadow-md ring-2 ring-white"
          title={user?.email}
        >
          {initials}
        </div>
        <button
          type="button"
          onClick={logout}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-md"
        >
          Log out
        </button>
      </div>
    </header>
  )
}
