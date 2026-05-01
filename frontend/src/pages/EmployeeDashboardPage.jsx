import { useEffect, useState } from 'react'
import { fetchTasks, updateTaskRequest } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { StatusBadge } from '../components/ui/StatusBadge'
import { PageHeader } from '../components/ui/PageHeader'
import { StatCard } from '../components/ui/StatCard'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { EmptyState } from '../components/ui/EmptyState'
import { CheckCircle2, CircleDashed, CheckSquare, Calendar, Loader2 } from 'lucide-react'

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
  { value: 'in_progress', label: 'In Progress' },
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
    <>
      <PageHeader 
        title={`My Workspace, ${firstName}`}
        description="Here are the tasks assigned to you. Update status or add notes as you make progress."
      />

      <div className="grid gap-6 sm:grid-cols-3 mb-8">
        <StatCard 
          title="Total Assigned" 
          value={tasks.length} 
          icon={CheckSquare}
        />
        <StatCard 
          title="In Progress" 
          value={tasks.filter((t) => t.status === 'in_progress').length} 
          icon={CircleDashed}
          className="text-blue-700"
        />
        <StatCard 
          title="Completed" 
          value={tasks.filter((t) => t.status === 'completed').length} 
          icon={CheckCircle2}
          className="text-emerald-700"
        />
      </div>

      {error && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-ink-900">Assigned Tasks</h2>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse h-32 bg-surface-50" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState 
          icon={CheckSquare}
          title="No tasks assigned"
          description="Your admin will assign tasks when ready. You're all caught up for now!"
        />
      ) : (
        <div className="flex flex-col gap-6">
          {tasks.map((task) => (
            <Card key={task._id} className="flex flex-col transition-shadow hover:shadow-dropdown">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-ink-900 mb-1">{task.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-ink-500 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Due {formatDate(task.dueDate)}</span>
                  </div>
                </div>
                <StatusBadge status={task.status} />
              </div>

              <div className="mb-6">
                <p className="text-sm leading-relaxed text-ink-700">
                  {task.description || <span className="italic text-ink-400">No description provided</span>}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 pt-6 border-t border-surface-100">
                {/* Status Update */}
                <div className="flex flex-col gap-2">
                  <label htmlFor={`status-${task._id}`} className="text-sm font-medium text-ink-800">
                    Update Status
                  </label>
                  <div className="flex items-center gap-3">
                    <select
                      id={`status-${task._id}`}
                      value={task.status}
                      onChange={(e) => handleStatusChange(task._id, e.target.value)}
                      disabled={updatingId === task._id}
                      className="flex-1 rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 disabled:opacity-60 disabled:bg-surface-50"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    {updatingId === task._id && <Loader2 className="w-4 h-4 text-ink-400 animate-spin" />}
                  </div>
                </div>

                {/* Submission Notes */}
                <div className="flex flex-col gap-2">
                  <label htmlFor={`notes-${task._id}`} className="text-sm font-medium text-ink-800">
                    Submission Notes / Links
                  </label>
                  <div className="flex items-start gap-3">
                    <textarea
                      id={`notes-${task._id}`}
                      rows={1}
                      value={notesMap[task._id] ?? ''}
                      onChange={(e) =>
                        setNotesMap((prev) => ({ ...prev, [task._id]: e.target.value }))
                      }
                      placeholder="Add a link or note…"
                      className="flex-1 resize-y min-h-[42px] rounded-lg border border-surface-200 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition placeholder:text-ink-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => handleSubmitNotes(task._id)}
                      isLoading={updatingId === task._id}
                    >
                      Save Note
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  )
}
