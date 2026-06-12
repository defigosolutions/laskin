import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Eye, EyeOff, Sparkles, Lock, Mail } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { isAuthenticated, login } = useAuth()
  const [email, setEmail] = useState('admin@laskinclinic.com')
  const [password, setPassword] = useState('Admin123!')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (isAuthenticated) return <Navigate to="/admin-laskin/dashboard" replace />

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
    } catch (err) {
      const e = err as { message?: string; code?: string }
      setError(e.message ?? 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-admin-bg flex">
      {/* Left — brand panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-admin-surface border-r border-admin-border flex-col items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent" />
        <div className="absolute top-1/4 -left-20 h-80 w-80 rounded-full bg-gold/5 blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 h-60 w-60 rounded-full bg-gold/8 blur-3xl" />
        <div className="relative z-10 max-w-sm text-center">
          <div className="mb-8 flex justify-center">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-gold-light to-gold flex items-center justify-center shadow-gold-glow">
              <Sparkles className="h-8 w-8 text-admin-bg" />
            </div>
          </div>
          <p className="text-3xl font-light font-sans text-admin-text mb-3 tracking-tight">LA Skin & Aesthetics</p>
          <p className="text-admin-muted text-sm leading-relaxed">
            The administration portal for managing your luxury aesthetics clinic — bookings, treatments, specialists, and more.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[['2,843', 'Active Clients'], ['5', 'Branches'], ['147', 'This Month']].map(([val, lbl]) => (
              <div key={lbl} className="rounded-xl border border-admin-border bg-admin-card p-3">
                <p className="text-xl font-semibold text-gold">{val}</p>
                <p className="text-[10px] text-admin-muted mt-0.5">{lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — login form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-gold-light to-gold flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-admin-bg" />
            </div>
            <div>
              <p className="text-sm font-semibold text-admin-text">LA Skin & Aesthetics</p>
              <p className="text-[10px] text-admin-muted uppercase tracking-wider">Admin Portal</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold font-sans text-admin-text">Welcome back</h2>
            <p className="text-sm text-admin-muted mt-1">Sign in to your admin account</p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@laskinaesthetics.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="h-3.5 w-3.5" />}
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs text-gold hover:text-gold-light transition-colors">
                  Forgot password?
                </button>
              </div>
              <Input
                id="password"
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="h-3.5 w-3.5" />}
                iconRight={
                  <button type="button" onClick={() => setShowPass(!showPass)} className="cursor-pointer">
                    {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                }
                required
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 rounded border-admin-border bg-admin-input text-gold accent-gold"
              />
              <label htmlFor="remember" className="text-xs text-admin-muted cursor-pointer">
                Keep me signed in
              </label>
            </div>

            <Button type="submit" className="w-full mt-2" size="lg" loading={loading}>
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-admin-subtle">
            Credentials are pre-filled for development. Just click Sign in.
          </p>
        </div>
      </div>
    </div>
  )
}
