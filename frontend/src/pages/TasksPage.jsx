import { useEffect, useState } from 'react'
import { createTaskRequest, deleteTaskRequest, fetchTasks, fetchEmployees } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { StatusBadge } from '../components/ui/StatusBadge'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { EmptyState } from '../components/ui/EmptyState'
import { Plus, Trash2, Calendar, User, CheckSquare } from 'lucide-react'

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

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [assignedTo, setAssignedTo] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

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
      const msg = err.response?.data?.message || err.message || 'Could not delete task.'
      setListError(msg)
    } finally {
      setDeletingId(null)
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
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
      setIsModalOpen(false)
      await loadTasks()
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Could not create task.'
      setFormError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      <PageHeader 
        title="Tasks"
        description={isAdmin ? 'Manage work items across your organization.' : 'Review your assigned work items.'}
        action={
          isAdmin && (
            <Button onClick={() => setIsModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          )
        }
      />

      {listError && (
        <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200 text-sm text-red-800">
          {listError}
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse h-40 bg-surface-50" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState 
          icon={CheckSquare}
          title="No tasks found"
          description={isAdmin ? "Get started by creating a new task for your team." : "You're all caught up!"}
          action={isAdmin ? <Button onClick={() => setIsModalOpen(true)}>Create Task</Button> : null}
        />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <Card key={task._id} className="flex flex-col hover:shadow-dropdown transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-3">
                <h3 className="font-semibold text-ink-900 line-clamp-1" title={task.title}>{task.title}</h3>
                <StatusBadge status={task.status} />
              </div>
              
              <p className="text-sm text-ink-500 mb-4 line-clamp-2 flex-1">
                {task.description || 'No description provided.'}
              </p>

              <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-surface-100">
                <div className="flex items-center gap-2 text-xs text-ink-500">
                  <User className="w-3.5 h-3.5" />
                  <span className="truncate">{task.assignedTo?.name || 'Unassigned'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-ink-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(task.dueDate)}</span>
                </div>
              </div>

              {isAdmin && (
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Keeping standard flow but putting actions inside if needed, or stick to the bottom right. Let's add delete to the bottom for mobile friendliness. */}
                </div>
              )}
              {isAdmin && (
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(task._id)}
                    isLoading={deletingId === task._id}
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Delete
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Admin Create Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Task"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 border border-red-200">
              {formError}
            </div>
          )}

          <Input
            label="Title"
            id="task-title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Onboard new tenant schema"
          />

          <div className="flex flex-col gap-1.5">
            <label htmlFor="task-description" className="text-sm font-medium text-ink-800">
              Description
            </label>
            <textarea
              id="task-description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-surface-200 rounded-lg shadow-sm text-sm placeholder-ink-400 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-y"
              placeholder="Context, acceptance criteria, or links…"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="task-assignee" className="text-sm font-medium text-ink-800">
                Assignee
              </label>
              <select
                id="task-assignee"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-surface-200 rounded-lg shadow-sm text-sm text-ink-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                <option value="">Unassigned</option>
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.email})
                  </option>
                ))}
              </select>
            </div>
            
            <Input
              label="Due Date"
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-surface-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={submitting}>
              Create Task
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
