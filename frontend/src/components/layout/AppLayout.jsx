import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

export function AppLayout() {
  return (
    <div className="flex h-screen bg-canvas overflow-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden relative">
        <TopBar />
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl w-full flex flex-col gap-6 animate-in fade-in duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
