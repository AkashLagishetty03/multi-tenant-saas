import { api } from './client'



export async function fetchPlatformStats() {
  const { data } = await api.get('/api/administrator/stats')
  return data
}

export async function fetchOrganizations() {
  const { data } = await api.get('/api/administrator/organizations')
  return data
}

export async function deleteOrganizationRequest(id) {
  const { data } = await api.delete(`/api/administrator/organization/${id}`)
  return data
}
