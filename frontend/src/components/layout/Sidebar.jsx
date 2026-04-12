import { NavLink } from 'react-router-dom'

const linkBase =
  'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors'
const inactive =
  'text-slate-600 shadow-sm hover:bg-slate-100 hover:text-slate-900 hover:shadow-md'
const active =
  'bg-slate-900 text-white shadow-md hover:bg-slate-800'

function NavIcon({ name }) {
  if (name === 'dashboard') {
    return (
      <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
      </svg>
    )
  }
  return (
    <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
    </svg>
  )
}

export function Sidebar() {
  return (
    <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200/80 bg-white/90 shadow-md backdrop-blur-sm">
      <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white shadow-md">
          W
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">Workspace</p>
          <p className="truncate text-xs text-slate-500">Multi-tenant</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-2 p-4">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}
        >
          <NavIcon name="dashboard" />
          Dashboard
        </NavLink>
        <NavLink
          to="/tasks"
          className={({ isActive }) => `${linkBase} ${isActive ? active : inactive}`}
        >
          <NavIcon name="tasks" />
          Tasks
        </NavLink>
      </nav>
      <div className="border-t border-slate-100 p-4">
        <p className="text-xs leading-relaxed text-slate-400">
          Organize work by team. Tasks stay scoped to your organization.
        </p>
      </div>
    </aside>
  )
}
