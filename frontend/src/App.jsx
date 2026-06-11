import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AppLayout } from './components/layout/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { TasksPage } from './pages/TasksPage'
import { EmployeeDashboardPage } from './pages/EmployeeDashboardPage'
import { AdministratorDashboardPage } from './pages/AdministratorDashboardPage'

/** Redirects to the correct dashboard based on user role */
function RoleHome() {
  const { user } = useAuth()
  if (user?.role === 'administrator') {
    return <Navigate to="/administrator-dashboard" replace />
  }
  if (user?.role === 'employee') {
    return <Navigate to="/employee-dashboard" replace />
  }
  return <DashboardPage />
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/workspace-login" element={<Navigate to="/login" replace />} />
            <Route path="/administrator-login" element={<Navigate to="/login" replace />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<RoleHome />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/employee-dashboard" element={<EmployeeDashboardPage />} />
              <Route path="/administrator-dashboard" element={<AdministratorDashboardPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
