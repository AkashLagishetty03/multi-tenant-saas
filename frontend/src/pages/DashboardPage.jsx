import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchTasks, addEmployeeRequest } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { StatusBadge } from '../components/ui/StatusBadge'

function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function DashboardPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [tasks, setTasks] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Add Employee form state
  const [empName, setEmpName] = useState('')
  const [empEmail, setEmpEmail] = useState('')
  const [empLoading, setEmpLoading] = useState(false)
  const [empError, setEmpError] = useState('')
  const [empSuccess, setEmpSuccess] = useState('')

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchTasks({ limit: 50 })
        if (!cancelled) {
          setTasks(data.tasks ?? [])
          setTotal(data.total ?? 0)
        }
      } catch (e) {
        if (!cancelled) {
          setError(
            e.response?.data?.message || e.message || 'Could not load tasks.'
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleAddEmployee(e) {
    e.preventDefault()
    setEmpError('')
    setEmpSuccess('')
    setEmpLoading(true)
    try {
      const data = await addEmployeeRequest({
        name: empName.trim(),
        email: empEmail.trim(),
      })
      setEmpName('')
      setEmpEmail('')
      setEmpSuccess(`${data.user.name} added successfully. Default password: Welcome@123`)
    } catch (err) {
      setEmpError(
        err.response?.data?.message || err.message || 'Could not add employee.'
      )
    } finally {
      setEmpLoading(false)
    }
  }

  const firstName = user?.name?.split(/\s+/)[0] || 'there'

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
          Hello, {firstName}
        </h1>
        <p className="mt-2 max-w-2xl text-slate-600">
          Here&apos;s a snapshot of work across your organization. Open{' '}
          <Link to="/tasks" className="font-medium text-slate-900 underline-offset-2 hover:underline">
            Tasks
          </Link>{' '}
          to create or review items in detail.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-md">
          <p className="text-sm font-medium text-slate-500">Total tasks</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">{total}</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-md">
          <p className="text-sm font-medium text-slate-500">Your role</p>
          <p className="mt-2 text-lg font-semibold capitalize text-slate-900">
            {user?.role ?? '—'}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-md">
          <p className="text-sm font-medium text-slate-500">Workspace</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">Active</p>
        </div>
      </div>

      {/* Add Employee — admin only */}
      {isAdmin ? (
        <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-md md:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Add Employee</h2>
          <p className="mt-1 text-sm text-slate-500">
            Add a team member to your organization. They&apos;ll get the default password <span className="font-medium text-slate-700">Welcome@123</span>.
          </p>

          <form onSubmit={handleAddEmployee} className="mt-5 flex flex-col gap-4">
            {empError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-md">
                {empError}
              </div>
            ) : null}
            {empSuccess ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-md">
                {empSuccess}
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="emp-name" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Name
                </label>
                <input
                  id="emp-name"
                  name="empName"
                  type="text"
                  required
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label htmlFor="emp-email" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  id="emp-email"
                  name="empEmail"
                  type="email"
                  required
                  value={empEmail}
                  onChange={(e) => setEmpEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                  placeholder="jane@company.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={empLoading}
              className="w-fit rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {empLoading ? 'Adding…' : 'Add employee'}
            </button>
          </form>
        </section>
      ) : null}

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recent tasks</h2>
            <p className="text-sm text-slate-500">Latest updates in your organization</p>
          </div>
          {isAdmin ? (
            <Link
              to="/tasks"
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-slate-800 hover:shadow-lg"
            >
              New task
            </Link>
          ) : (
            <Link
              to="/tasks"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 shadow-md transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-lg"
            >
              View tasks
            </Link>
          )}
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-md">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 px-4 py-16 text-center text-sm text-slate-500 shadow-md">
            Loading...
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border border-slate-200/80 bg-white p-10 text-center shadow-md">
            <p className="text-slate-600">No tasks yet.</p>
            <p className="mt-2 text-sm text-slate-500">
              Admins can create tasks from the Tasks page.
            </p>
            <Link
              to="/tasks"
              className="mt-6 inline-flex rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-md transition hover:bg-slate-800 hover:shadow-lg"
            >
              Go to Tasks
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-3 font-medium text-slate-600">Title</th>
                    <th className="px-5 py-3 font-medium text-slate-600">Status</th>
                    <th className="px-5 py-3 font-medium text-slate-600">Due</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.map((task) => (
                    <tr key={task._id} className="transition hover:bg-slate-50/80">
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">{task.title}</p>
                        {task.description ? (
                          <p className="mt-0.5 line-clamp-2 text-slate-500">{task.description}</p>
                        ) : null}
                      </td>
                      <td className="px-5 py-4 align-top">
                        <StatusBadge status={task.status} />
                      </td>
                      <td className="px-5 py-4 align-top text-slate-600 tabular-nums">
                        {formatDate(task.dueDate)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
