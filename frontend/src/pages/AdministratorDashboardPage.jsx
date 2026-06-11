import React, { useEffect, useState } from 'react'
import { PageHeader } from '../components/ui/PageHeader'
import { Modal } from '../components/ui/Modal'
import { StatusBadge } from '../components/ui/StatusBadge'
import { fetchPlatformStats, fetchOrganizations, deleteOrganizationRequest } from '../api/administrator'

export function AdministratorDashboardPage() {
  const [stats, setStats] = useState(null)
  const [organizations, setOrganizations] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [orgToDelete, setOrgToDelete] = useState(null)
  const [expandedOrgId, setExpandedOrgId] = useState(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    setError('')
    try {
      const [statsData, orgsData] = await Promise.all([
        fetchPlatformStats(),
        fetchOrganizations()
      ])
      setStats(statsData)
      setOrganizations(orgsData)
    } catch (err) {
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteClick = (org) => {
    setOrgToDelete(org)
    setIsDeleteModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!orgToDelete) return
    
    try {
      await deleteOrganizationRequest(orgToDelete._id)
      setOrganizations(organizations.filter(o => o._id !== orgToDelete._id))
      setStats(prev => ({
        ...prev,
        totalOrganizations: prev.totalOrganizations - 1,
        activeOrganizations: prev.activeOrganizations - 1,
        totalAdmins: prev.totalAdmins - 1,
        totalEmployees: prev.totalEmployees - orgToDelete.totalEmployees
      }))
      setIsDeleteModalOpen(false)
      setOrgToDelete(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete organization.')
    }
  }

  const toggleExpand = (orgId) => {
    setExpandedOrgId(expandedOrgId === orgId ? null : orgId)
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent-color)] border-t-transparent"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-500">
        {error}
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader 
        title="Platform Overview" 
        description="Global metrics and health across all tenant organizations." 
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Organizations', value: stats?.totalOrganizations || 0, icon: '🏢' },
          { label: 'Active Organizations', value: stats?.activeOrganizations || 0, icon: '✅' },
          { label: 'Total Admins', value: stats?.totalAdmins || 0, icon: '👑' },
          { label: 'Total Employees', value: stats?.totalEmployees || 0, icon: '👥' },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 shadow-sm transition-all hover:border-[var(--accent-color)]/30 hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-[var(--text-secondary)]">{stat.label}</span>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <p className="text-3xl font-bold text-[var(--text-primary)]">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-sm overflow-hidden">
        <div className="border-b border-[var(--border-color)] px-6 py-5 bg-[var(--bg-primary)]/50">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">Tenant Organizations</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[var(--text-secondary)]">
            <thead className="bg-[var(--bg-secondary)] text-xs uppercase text-[var(--text-secondary)] border-b border-[var(--border-color)]">
              <tr>
                <th className="px-6 py-4 font-medium">Organization</th>
                <th className="px-6 py-4 font-medium">Admin</th>
                <th className="px-6 py-4 font-medium text-center">Employees</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {organizations.map((org) => (
                <React.Fragment key={org._id}>
                  <tr className="hover:bg-[var(--bg-primary)]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[var(--text-primary)]">{org.name}</div>
                      <div className="text-xs text-[var(--text-secondary)] mt-1">ID: {org._id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[var(--text-primary)]">{org.adminName}</div>
                      <div className="text-xs text-[var(--text-secondary)]">{org.adminEmail}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center justify-center bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-full h-8 w-8 text-sm font-medium">
                        {org.totalEmployees}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={org.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button 
                          onClick={() => toggleExpand(org._id)}
                          className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                          {expandedOrgId === org._id ? 'Hide Details' : 'View Details'}
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(org)}
                          className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {expandedOrgId === org._id && (
                    <tr>
                      <td colSpan={5} className="bg-[var(--bg-primary)]/30 border-b border-[var(--border-color)] px-6 py-6">
                        <div className="pl-4 border-l-2 border-[var(--accent-color)]/30 space-y-4">
                          <h4 className="text-sm font-semibold text-[var(--text-primary)] uppercase tracking-wider">Employee Roster</h4>
                          {org.employees && org.employees.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              {org.employees.map(emp => (
                                <div key={emp._id} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 rounded-xl flex items-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-[var(--accent-color)]/10 text-[var(--accent-color)] flex items-center justify-center font-bold">
                                    {emp.name.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-[var(--text-primary)]">{emp.name}</p>
                                    <p className="text-xs text-[var(--text-secondary)]">{emp.email}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-[var(--text-secondary)]">No employees registered for this organization.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
              
              {organizations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[var(--text-secondary)]">
                    No organizations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)}
        title="Danger: Delete Organization"
      >
        <div className="space-y-6">
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <p className="text-red-500 font-medium mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Destructive Action Warning
            </p>
            <p className="text-sm text-red-500/80">
              You are about to permanently delete <strong>{orgToDelete?.name}</strong>.
              This action will completely erase the organization, all its users, and all its tasks.
              This cannot be undone.
            </p>
          </div>
          
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded-xl transition-colors"
            >
              Confirm Deletion
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
