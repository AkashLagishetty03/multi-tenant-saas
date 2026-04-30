import { useEffect, useState } from 'react'
import { fetchTasks, updateTaskRequest } from '../api/client'
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

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
]

export function EmployeeDashboardPage() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [notesMap, setNotesMap] = useState({})

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchTasks({ limit: 100 })
        if (!cancelled) {
          setTasks(data.tasks ?? [])
          const initial = {}
          for (const t of data.tasks ?? []) {
            initial[t._id] = t.submissionNotes || ''
          }
          setNotesMap(initial)
        }
      } catch (e) {
        if (!cancelled) {
          setError(e.response?.data?.message || e.message || 'Could not load tasks.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => { cancelled = true }
  }, [])

  async function handleStatusChange(taskId, newStatus) {
    setUpdatingId(taskId)
    setError('')
    try {
      const notes = notesMap[taskId] || ''
      const updated = await updateTaskRequest(taskId, {
        status: newStatus,
        submissionNotes: notes,
      })
      setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)))
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Could not update task.')
    } finally {
      setUpdatingId(null)
    }
  }

  async function handleSubmitNotes(taskId) {
    setUpdatingId(taskId)
    setError('')
    try {
      const task = tasks.find((t) => t._id === taskId)
      const updated = await updateTaskRequest(taskId, {
        status: task.status,
        submissionNotes: notesMap[taskId] || '',
      })
      setTasks((prev) => prev.map((t) => (t._id === taskId ? updated : t)))
    } catch (e) {
      setError(e.response?.data?.message || e.message || 'Could not save notes.')
    } finally {
      setUpdatingId(null)
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
          Here are the tasks assigned to you. Update status or add notes as you make progress.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-md">
          <p className="text-sm font-medium text-slate-500">My tasks</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">{tasks.length}</p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-md">
          <p className="text-sm font-medium text-slate-500">Completed</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-emerald-700">
            {tasks.filter((t) => t.status === 'completed').length}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-md">
          <p className="text-sm font-medium text-slate-500">In progress</p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-blue-700">
            {tasks.filter((t) => t.status === 'in-progress').length}
          </p>
        </div>
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
          <p className="text-slate-600">No tasks assigned to you yet.</p>
          <p className="mt-2 text-sm text-slate-500">
            Your admin will assign tasks when ready.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {tasks.map((task) => (
            <li
              key={task._id}
              className="flex flex-col gap-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-md transition hover:shadow-lg"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-slate-900">{task.title}</h3>
                  {task.description ? (
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{task.description}</p>
                  ) : (
                    <p className="mt-1 text-sm italic text-slate-400">No description</p>
                  )}
                </div>
                <StatusBadge status={task.status} />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span>Due: {formatDate(task.dueDate)}</span>
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-4">
                <div className="flex flex-wrap items-center gap-3">
                  <label htmlFor={`status-${task._id}`} className="text-sm font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    id={`status-${task._id}`}
                    value={task.status}
                    onChange={(e) => handleStatusChange(task._id, e.target.value)}
                    disabled={updatingId === task._id}
                    className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10 disabled:opacity-60"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {updatingId === task._id ? (
                    <span className="text-xs text-slate-400">Saving…</span>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor={`notes-${task._id}`} className="text-sm font-medium text-slate-700">
                    Submission notes / link
                  </label>
                  <textarea
                    id={`notes-${task._id}`}
                    rows={2}
                    value={notesMap[task._id] ?? ''}
                    onChange={(e) =>
                      setNotesMap((prev) => ({ ...prev, [task._id]: e.target.value }))
                    }
                    placeholder="Add a link, comment, or completion note…"
                    className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                  />
                  <button
                    type="button"
                    onClick={() => handleSubmitNotes(task._id)}
                    disabled={updatingId === task._id}
                    className="w-fit rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {updatingId === task._id ? 'Saving…' : 'Save notes'}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
