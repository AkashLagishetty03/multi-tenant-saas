import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Briefcase, Building2, CheckSquare, Users, ShieldCheck, BarChart3 } from 'lucide-react'

export function LoginPage() {
  const { isAuthenticated, login } = useAuth()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isAuthenticated) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email.trim(), password)
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Unable to sign in. Check your connection and try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-canvas">
      <div className="flex flex-1 flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white shadow-sm">
              <Briefcase className="w-6 h-6" />
            </div>
            <h2 className="mt-8 text-2xl font-bold tracking-tight text-ink-900">
              Admin / Employee Login
            </h2>
            <p className="mt-2 text-sm text-ink-500">
              New organization?{' '}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
                Create Admin Workspace
              </Link>
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

              <Input
                label="Email address"
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />

              <Input
                label="Password"
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-surface-300 text-primary-600 focus:ring-primary-600"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-ink-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm leading-6">
                  <a href="#" className="font-semibold text-primary-600 hover:text-primary-500">
                    Forgot password?
                  </a>
                </div>
              </div>

              <Button type="submit" className="w-full" size="lg" isLoading={loading}>
                Sign in
              </Button>
            </form>
          </div>
        </div>
      </div>
      <div className="relative hidden w-0 flex-1 lg:block bg-surface-100">
        <div className="absolute inset-0 h-full w-full bg-gradient-to-br from-primary-600 to-indigo-900 flex items-center justify-center p-12 overflow-hidden">
          
          {/* Abstract background shapes */}
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary-500/20 blur-3xl" />

          <div className="relative w-full max-w-lg aspect-square flex items-center justify-center">
            
            {/* Orbital Guide Lines */}
            <div className="absolute w-[90%] h-[90%] rounded-full border border-white/10 border-dashed animate-orbit duration-[40s]" />
            <div className="absolute w-[65%] h-[65%] rounded-full border border-white/10 border-dashed animate-orbit duration-[30s] direction-reverse" />
            
            {/* Glow Particles */}
            <div className="absolute top-[15%] left-[20%] w-2 h-2 rounded-full bg-white/40 blur-[2px] animate-pulse-soft" />
            <div className="absolute bottom-[20%] right-[15%] w-3 h-3 rounded-full bg-primary-400/30 blur-[4px] animate-pulse-soft delay-700" />
            <div className="absolute top-[40%] right-[10%] w-2 h-2 rounded-full bg-white/20 blur-[1px] animate-pulse-soft delay-1000" />
            <div className="absolute bottom-[40%] left-[5%] w-1.5 h-1.5 rounded-full bg-white/30 blur-[1px] animate-pulse-soft delay-300" />

            {/* Center Hub */}
            <div className="absolute z-20 bg-white dark:bg-surface-800 p-8 rounded-full shadow-2xl animate-float flex flex-col items-center gap-3 text-center w-52 h-52 justify-center border border-white/20 ring-8 ring-white/5">
              <span className="text-5xl mb-2">🏢</span>
              <p className="font-bold text-ink-900 leading-tight text-base">Multi-tenant<br/>Workspaces</p>
            </div>

            {/* Orbiting Cards */}
            <div className="absolute top-[5%] left-[5%] z-10 bg-white dark:bg-surface-800 p-3 rounded-2xl shadow-xl flex items-center gap-3 animate-float-delayed transform -rotate-6 hover:rotate-0 transition-all duration-300 cursor-default border border-white/10">
              <span className="text-3xl">📋</span>
              <div>
                <p className="text-sm font-bold text-ink-900 leading-tight whitespace-nowrap">Task Management</p>
                <p className="text-[10px] text-ink-500 font-medium uppercase tracking-wider">Productivity</p>
              </div>
            </div>

            <div className="absolute top-[20%] -right-4 z-10 bg-white dark:bg-surface-800 p-3 rounded-2xl shadow-xl flex items-center gap-3 animate-float transform rotate-3 hover:rotate-0 transition-all duration-300 cursor-default border border-white/10">
              <span className="text-3xl">👥</span>
              <div>
                <p className="text-sm font-bold text-ink-900 leading-tight whitespace-nowrap">Employee Management</p>
                <p className="text-[10px] text-ink-500 font-medium uppercase tracking-wider">Human Resources</p>
              </div>
            </div>

            <div className="absolute bottom-[30%] -left-8 z-10 bg-white dark:bg-surface-800 p-3 rounded-2xl shadow-xl flex items-center gap-3 animate-float transform -rotate-3 hover:rotate-0 transition-all duration-300 cursor-default border border-white/10">
              <span className="text-3xl">🔐</span>
              <div>
                <p className="text-sm font-bold text-ink-900 leading-tight whitespace-nowrap">Role Based Access</p>
                <p className="text-[10px] text-ink-500 font-medium uppercase tracking-wider">Security</p>
              </div>
            </div>

            <div className="absolute bottom-[5%] right-[5%] z-10 bg-white dark:bg-surface-800 p-3 rounded-2xl shadow-xl flex items-center gap-3 animate-float-delayed transform rotate-6 hover:rotate-0 transition-all duration-300 cursor-default border border-white/10">
              <span className="text-3xl">📊</span>
              <div>
                <p className="text-sm font-bold text-ink-900 leading-tight whitespace-nowrap">Analytics / Insights</p>
                <p className="text-[10px] text-ink-500 font-medium uppercase tracking-wider">Data Insights</p>
              </div>
            </div>

            <div className="absolute -bottom-8 left-[25%] z-10 bg-white dark:bg-surface-800 p-3 rounded-2xl shadow-xl flex items-center gap-3 animate-float transform -rotate-2 hover:rotate-0 transition-all duration-300 cursor-default border border-white/10">
              <span className="text-3xl">🛡️</span>
              <div>
                <p className="text-sm font-bold text-ink-900 leading-tight whitespace-nowrap">Secure & Reliable</p>
                <p className="text-[10px] text-ink-500 font-medium uppercase tracking-wider">Compliance</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
