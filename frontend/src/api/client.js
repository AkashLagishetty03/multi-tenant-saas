import axios from 'axios'

const TOKEN_KEY = 'saas_token'

const API_BASE_URL =
  import.meta.env.VITE_API_URL?.trim() || 'http://localhost:5000'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem('saas_user')
      if (!window.location.pathname.startsWith('/login')) {
        window.location.assign('/login')
      }
    }
    return Promise.reject(err)
  }
)

export { TOKEN_KEY }

export async function loginRequest(email, password) {
  const { data } = await api.post('/api/auth/login', { email, password })
  return data
}

export async function fetchTasks(params = {}) {
  const { data } = await api.get('/api/tasks', {
    params: { page: 1, limit: 100, ...params },
  })
  return data
}

export async function createTaskRequest(body) {
  const { data } = await api.post('/api/tasks', body)
  return data
}

export async function deleteTaskRequest(id) {
  await api.delete(`/api/tasks/${id}`)
}
