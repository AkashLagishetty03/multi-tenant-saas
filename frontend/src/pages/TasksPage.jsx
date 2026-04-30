import { useEffect, useState } from 'react'
import { createTaskRequest, deleteTaskRequest, fetchTasks, fetchEmployees } from '../api/client'
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

export function TasksPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  const [tasks, setTasks] = useState([])
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState('')
  const [deletingId, setDeletingId] = useState(null)

  async function loadTasks() {
    setListError('')
    try {
      const data = await fetchTasks({ limit: 50 })
      setTasks(data.tasks ?? [])
    } catch (e) {
      setListError(e.response?.data?.message || e.message || 'Could not load tasks.')
    }
  }

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      await loadTasks()
      if (isAdmin) {
        try {
          const empData = await fetchEmployees()
          if (!cancelled) setEmployees(empData.employees ?? [])
        } catch (e) {
          console.error("Failed to load employees", e)
        }
      }
      if (!cancelled) setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [isAdmin])

  async function handleDelete(taskId) {
    setListError('')
    setDeletingId(taskId)
    try {
      await deleteTaskRequest(taskId)
      setTasks((prev) => prev.filter((t) => t._id !== taskId))
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || 'Could not delete task.'
      setListError(msg)
    } finally {
      setDeletingId(null)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    setFormSuccess('')
    setSubmitting(true)
    try {
      await createTaskRequest({
        title: title.trim(),
        description: description.trim(),
        assignedTo: assignedTo || undefined,
        dueDate: dueDate || undefined,
      })
      setTitle('')
      setDescription('')
      setAssignedTo('')
      setDueDate('')
      setFormSuccess('Task created successfully.')
      await loadTasks()
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Could not create task.'
      setFormError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Tasks</h1>
        <p className="mt-2 text-slate-600">
          {isAdmin
            ? 'Create work items for your organization and keep the queue up to date.'
            : 'Review work items for your organization. Admins manage task creation and removal.'}
        </p>
      </div>

      {isAdmin ? (
        <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-md md:p-6">
          <h2 className="text-lg font-semibold text-slate-900">Create a task</h2>
          <p className="mt-1 text-sm text-slate-500">
            Give it a clear title so your team knows what to do next.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            {formError ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-md">
                {formError}
              </div>
            ) : null}
            {formSuccess ? (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-md">
                {formSuccess}
              </div>
            ) : null}

            <div>
              <label htmlFor="task-title" className="mb-1.5 block text-sm font-medium text-slate-700">
                Title
              </label>
              <input
                id="task-title"
                name="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                placeholder="e.g. Onboard new tenant schema"
              />
            </div>

            <div>
              <label
                htmlFor="task-description"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Description
              </label>
              <textarea
                id="task-description"
                name="description"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                placeholder="Context, acceptance criteria, or links…"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="task-assignee" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Assign To
                </label>
                <select
                  id="task-assignee"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                >
                  <option value="">Unassigned</option>
                  {employees.map((emp) => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name} ({emp.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="task-due-date" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Due Date
                </label>
                <input
                  id="task-due-date"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white focus:ring-2 focus:ring-slate-900/10"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-fit rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-slate-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Loading...' : 'Create task'}
            </button>
          </form>
        </section>
      ) : null}

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">All tasks</h2>
          <p className="mt-1 text-sm text-slate-500">Cards for a quick scan of status</p>
        </div>

        {listError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-md">
            {listError}
          </div>
        ) : null}

        {loading ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 px-4 py-14 text-center text-sm text-slate-500 shadow-md">
            Loading...
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border border-slate-200/80 bg-white p-10 text-center text-sm text-slate-500 shadow-md">
            No tasks to show.
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {tasks.map((task) => (
              <li
                key={task._id}
                className="flex flex-col gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-md transition hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 flex-1 font-semibold text-slate-900">{task.title}</h3>
                  <StatusBadge status={task.status} />
                </div>
                {task.description ? (
                  <p className="flex-1 text-sm leading-relaxed text-slate-600">{task.description}</p>
                ) : (
                  <p className="flex-1 text-sm italic text-slate-400">No description</p>
                )}
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-slate-500">
                  <span>Assignee: <span className="font-medium text-slate-700">{task.assignedTo?.name || 'Unassigned'}</span></span>
                  <span>Due: <span className="font-medium text-slate-700">{formatDate(task.dueDate)}</span></span>
                </div>

                {isAdmin ? (
                  <div className="mt-auto flex justify-end border-t border-slate-100 pt-3">
                    <button
                      type="button"
                      onClick={() => handleDelete(task._id)}
                      disabled={deletingId === task._id}
                      className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm transition hover:border-red-300 hover:bg-red-50 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingId === task._id ? 'Loading...' : 'Delete'}
                    </button>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
