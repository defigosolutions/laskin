import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  CalendarDays, UserCheck, TrendingUp,
  CheckCircle, Clock, Star, AlertCircle, RefreshCw, Activity,
} from 'lucide-react'

import StatCard from '../components/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { BookingStatusBadge } from '../components/StatusBadge'
import { LoadingCards, LoadingSpinner } from '../components/LoadingState'
import { dashboardService } from '../services/api'
import type { BookingStatus, DashboardBooking, DashboardAuditLog } from '../types'
import { formatDate } from '../lib/utils'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function bookingLabel(b: DashboardBooking): string {
  return b.treatment?.name ?? b.package?.name ?? 'Booking'
}

function specialistLabel(b: DashboardBooking): string {
  return b.specialist?.fullName ?? 'Unassigned'
}

function auditLabel(log: DashboardAuditLog): string {
  if (log.userEmail) return log.userEmail
  if (log.userId) return `User #${log.userId}`
  return 'System'
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-green-500',
  pending: 'bg-amber-500',
  completed: 'bg-purple-500',
  rescheduled: 'bg-blue-500',
  cancelled: 'bg-red-500',
  no_show: 'bg-admin-border2',
}

const ENTITY_ICONS: Record<string, string> = {
  booking: '📅',
  user: '👤',
  treatment: '💉',
  specialist: '🩺',
  branch: '🏥',
  review: '⭐',
  site_setting: '⚙️',
  package: '📦',
  category: '🗂️',
  auth: '🔐',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate()

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.getStats(),
    refetchInterval: 60_000,
  })

  const stats = data?.stats
  const recentBookings = data?.recentBookings ?? []
  const recentAuditLogs = data?.recentAuditLogs ?? []

  const bookingStatusEntries = stats
    ? Object.entries(stats.bookingsByStatus).filter(([, count]) => count > 0)
    : []
  const totalStatusCount = bookingStatusEntries.reduce((s, [, n]) => s + n, 0)

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Hero Welcome */}
      <div className="relative overflow-hidden rounded-xl border border-admin-border bg-admin-card/80 backdrop-blur-md p-5 md:p-6 shadow-card">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gold/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <p className="text-xl md:text-2xl font-semibold font-sans text-admin-text tracking-tight mb-1">
            Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, Admin
          </p>
          <p className="text-sm text-admin-muted mb-5">
            Here's what's happening at LA Skin & Aesthetics today.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Button onClick={() => navigate('/admin-laskin/bookings')} size="sm" className="rounded-full">
              <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
              View Bookings
            </Button>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-admin-muted tracking-wide uppercase">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
              {isFetching && !isLoading && (
                <RefreshCw className="h-3 w-3 text-admin-muted animate-spin" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error State */}
      {isError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-5 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-400">Failed to load dashboard</p>
            <p className="text-xs text-admin-muted mt-0.5">
              {(error as { message?: string })?.message ?? 'Unable to reach the backend. Make sure the server is running.'}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => void refetch()}>Retry</Button>
        </div>
      )}

      {/* Stats Grid — 8 cards in 2 rows of 4 */}
      {isLoading ? (
        <LoadingCards count={8} />
      ) : stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings.toLocaleString()}
            icon={<CalendarDays className="h-5 w-5" />}
            accent
          />
          <StatCard
            title="Today's Bookings"
            value={stats.todayBookings}
            icon={<Clock className="h-5 w-5" />}
            description="Appointments today"
          />
          <StatCard
            title="Pending"
            value={stats.pendingBookings}
            icon={<TrendingUp className="h-5 w-5" />}
            description="Awaiting confirmation"
          />
          <StatCard
            title="Confirmed"
            value={stats.confirmedBookings}
            icon={<CheckCircle className="h-5 w-5" />}
            accent
          />
          <StatCard
            title="Completed"
            value={stats.completedBookings}
            icon={<CheckCircle className="h-5 w-5" />}
            description="All time"
          />
          <StatCard
            title="Specialists"
            value={stats.totalSpecialists}
            icon={<UserCheck className="h-5 w-5" />}
            description="Active specialists"
          />
          <StatCard
            title="Treatments"
            value={stats.totalTreatments}
            icon={<Activity className="h-5 w-5" />}
            description="Published treatments"
          />
          <StatCard
            title="Reviews"
            value={stats.totalReviews}
            icon={<Star className="h-5 w-5" />}
            description="Total reviews"
          />
        </div>
      )}

      {/* Bookings by Status + Recent Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Bookings by Status */}
        {isLoading ? (
          <Card>
            <CardContent className="p-5"><LoadingSpinner /></CardContent>
          </Card>
        ) : stats && bookingStatusEntries.length > 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Bookings by Status</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              {bookingStatusEntries.map(([status, count]) => {
                const pct = totalStatusCount > 0 ? Math.round((count / totalStatusCount) * 100) : 0
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-admin-text capitalize">{status.replace('_', ' ')}</span>
                      <span className="text-xs text-admin-muted">{count}</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-admin-border overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${STATUS_COLORS[status] ?? 'bg-admin-muted'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        ) : !isLoading && (
          <Card>
            <CardHeader><CardTitle>Bookings by Status</CardTitle></CardHeader>
            <CardContent className="px-5 pb-5">
              <p className="text-sm text-admin-muted">No bookings yet.</p>
            </CardContent>
          </Card>
        )}

        {/* Recent Bookings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Bookings</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/admin-laskin/bookings')}>
                View all
              </Button>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {isLoading ? (
              <div className="p-5"><LoadingSpinner /></div>
            ) : recentBookings.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <CalendarDays className="h-8 w-8 text-admin-muted mx-auto mb-2" />
                <p className="text-sm text-admin-muted">No bookings yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-admin-border">
                {recentBookings.map((b) => (
                  <div key={b.id} className="flex items-center gap-4 px-5 py-3 hover:bg-admin-hover/30 transition-colors">
                    <div className="h-8 w-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-medium text-gold">
                        {b.customer.fullName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-admin-text truncate">{b.customer.fullName}</p>
                      <p className="text-xs text-admin-muted truncate">
                        {bookingLabel(b)} · {specialistLabel(b)}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-admin-muted">{formatDate(b.appointmentDate)}</p>
                      {b.startTime && (
                        <p className="text-xs font-medium text-gold mt-0.5">{b.startTime}</p>
                      )}
                    </div>
                    <BookingStatusBadge status={b.status as BookingStatus} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Audit Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-gold" />
              Recent Audit Activity
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/admin-laskin/audit-logs')}>
              View all
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {isLoading ? (
            <div className="p-5"><LoadingSpinner /></div>
          ) : recentAuditLogs.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <Activity className="h-8 w-8 text-admin-muted mx-auto mb-2" />
              <p className="text-sm text-admin-muted">No audit activity yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-admin-border">
              {recentAuditLogs.map((log) => (
                <div key={log.id} className="flex items-center gap-4 px-5 py-3 hover:bg-admin-hover/30 transition-colors">
                  <div className="h-8 w-8 rounded-full bg-admin-border/50 flex items-center justify-center shrink-0 text-sm">
                    {ENTITY_ICONS[log.entityType] ?? '🔹'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-admin-text">
                      <span className="text-gold capitalize">{log.action.replace('_', ' ')}</span>
                      {' '}
                      <span className="text-admin-muted capitalize">{log.entityType.replace('_', ' ')}</span>
                      {log.entityId && (
                        <span className="text-admin-subtle text-xs ml-1">#{log.entityId}</span>
                      )}
                    </p>
                    <p className="text-xs text-admin-muted truncate">{auditLabel(log)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-admin-subtle">{relativeTime(log.createdAt)}</p>
                    {log.userRole && (
                      <p className="text-xs text-admin-muted mt-0.5 capitalize">
                        {log.userRole.replace('_', ' ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  )
}
