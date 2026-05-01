import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchTasks, addEmployeeRequest } from '../api/client'
import { useAuth } from '../context/AuthContext'
import { StatusBadge } from '../components/ui/StatusBadge'
import { StatCard } from '../components/ui/StatCard'
import { Card } from '../components/ui/Card'
import { DataTable } from '../components/ui/DataTable'
import { PageHeader } from '../components/ui/PageHeader'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Users, CheckSquare, Shield, Plus, Building2 } from 'lucide-react'

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

  // Add Employee Modal
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false)
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
        const data = await fetchTasks({ limit: 5 })
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
      // Close modal after short delay
      setTimeout(() => setIsEmployeeModalOpen(false), 3000)
    } catch (err) {
      setEmpError(
        err.response?.data?.message || err.message || 'Could not add employee.'
      )
    } finally {
      setEmpLoading(false)
    }
  }

  const firstName = user?.name?.split(/\s+/)[0] || 'there'

  const columns = [
    { header: 'Title', cell: (row) => (
      <div>
        <div className="font-medium text-ink-900">{row.title}</div>
        <div className="text-xs text-ink-500 truncate max-w-xs">{row.description}</div>
      </div>
    )},
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
    { header: 'Due Date', cell: (row) => formatDate(row.dueDate) }
  ]

  return (
    <>
      <PageHeader 
        title={`Welcome back, ${firstName}`}
        description="Here's a snapshot of work across your organization."
        action={
          isAdmin ? (
            <Button onClick={() => setIsEmployeeModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Employee
            </Button>
          ) : null
        }
      />

      <div className="grid gap-6 sm:grid-cols-3 mb-8">
        <StatCard 
          title="Total Tasks" 
          value={total} 
          icon={CheckSquare}
          trend="up"
          trendLabel="Active"
        />
        <StatCard 
          title="Your Role" 
          value={user?.role} 
          icon={Shield} 
          className="capitalize"
        />
        <StatCard 
          title="Workspace" 
          value="Active" 
          icon={Building2} 
        />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-ink-900">Recent Tasks</h2>
        <Link to="/tasks">
          <Button variant="ghost" size="sm">View all tasks</Button>
        </Link>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 border border-red-200 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <Card className="animate-pulse h-48 flex items-center justify-center">
          <div className="text-ink-400">Loading tasks...</div>
        </Card>
      ) : (
        <DataTable 
          columns={columns} 
          data={tasks} 
          keyField="_id" 
        />
      )}

      {/* Admin Add Employee Modal */}
      <Modal 
        isOpen={isEmployeeModalOpen} 
        onClose={() => {
          setIsEmployeeModalOpen(false)
          setEmpSuccess('')
          setEmpError('')
        }}
        title="Add New Employee"
      >
        <form onSubmit={handleAddEmployee} className="space-y-4">
          {empError && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 border border-red-200">
              {empError}
            </div>
          )}
          {empSuccess && (
            <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 border border-emerald-200">
              {empSuccess}
            </div>
          )}
          
          <p className="text-sm text-ink-500 mb-4">
            They will receive the default password: <span className="font-medium text-ink-800">Welcome@123</span>
          </p>

          <Input
            label="Full Name"
            id="emp-name"
            required
            value={empName}
            onChange={(e) => setEmpName(e.target.value)}
            placeholder="Jane Doe"
          />
          <Input
            label="Email Address"
            id="emp-email"
            type="email"
            required
            value={empEmail}
            onChange={(e) => setEmpEmail(e.target.value)}
            placeholder="jane@company.com"
          />
          
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" onClick={() => setIsEmployeeModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={empLoading}>
              Add Employee
            </Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
