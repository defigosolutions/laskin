import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Eye, MoreHorizontal, CheckCircle, XCircle, Calendar, UserCheck,
  AlertCircle, RefreshCw, CheckCheck, Clock, Search, Filter,
  User, MapPin, Stethoscope, CalendarDays,
} from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable, { type Column } from '../components/DataTable'
import { BookingStatusBadge } from '../components/StatusBadge'
import ConfirmDialog from '../components/ConfirmDialog'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter,
} from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { bookingsService, branchSelectService } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import type { Booking, BookingStatus } from '../types'
import { formatDate, formatRelative } from '../lib/utils'
import type { ApiError } from '../lib/apiClient'

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUSES: BookingStatus[] = ['pending', 'confirmed', 'rescheduled', 'completed', 'cancelled', 'no_show']

const CAN_MANAGE = new Set(['super_admin', 'clinic_manager', 'concierge'])
const CAN_FETCH_BRANCHES = new Set(['super_admin', 'clinic_manager'])

// ─── Helpers ──────────────────────────────────────────────────────────────────

function availableActions(status: BookingStatus) {
  return {
    confirm:    status === 'pending' || status === 'rescheduled',
    cancel:     status !== 'cancelled' && status !== 'completed',
    reschedule: status !== 'cancelled' && status !== 'completed' && status !== 'no_show',
    complete:   status === 'confirmed',
    no_show:    status === 'confirmed' || status === 'rescheduled',
    assign:     true,
  }
}

function serviceLabel(b: Booking) {
  return b.treatment?.name ?? b.package?.name ?? '—'
}

const AUDIT_STYLE: Record<string, { label: string; dot: string }> = {
  created:             { label: 'Booking created',       dot: 'bg-admin-muted' },
  confirmed:           { label: 'Confirmed',             dot: 'bg-green-500' },
  cancelled:           { label: 'Cancelled',             dot: 'bg-red-500' },
  rescheduled:         { label: 'Rescheduled',           dot: 'bg-blue-500' },
  completed:           { label: 'Completed',             dot: 'bg-purple-500' },
  no_show:             { label: 'Marked no show',        dot: 'bg-amber-500' },
  specialist_assigned: { label: 'Specialist assigned',   dot: 'bg-gold' },
}

// ─── Types ────────────────────────────────────────────────────────────────────

type PendingAction = {
  type: 'confirm' | 'complete' | 'no_show' | 'cancel' | 'reschedule' | 'assign'
  id: string
  reference: string
  booking?: Booking
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Bookings() {
  const queryClient = useQueryClient()
  const { user: me } = useAuth()
  const canManage      = CAN_MANAGE.has(me?.role ?? '')
  const canFetchBranch = CAN_FETCH_BRANCHES.has(me?.role ?? '')

  // ── Filters ──
  const [page, setPage]               = useState(1)
  const [limit, setLimit]             = useState(10)
  const [search, setSearch]           = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter]   = useState('')
  const [branchFilter, setBranchFilter] = useState('all')

  // ── Detail drawer ──
  const [detailId, setDetailId] = useState<string | null>(null)

  // ── Action state ──
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null)
  const [actionError, setActionError]     = useState('')
  const [cancelReason, setCancelReason]   = useState('')
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleTime, setRescheduleTime] = useState('')
  const [assignId, setAssignId]           = useState('')

  // ─── Queries ────────────────────────────────────────────────────────────────

  const listKey = ['bookings', page, limit, search, statusFilter, dateFilter, branchFilter] as const

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: listKey,
    queryFn: () => bookingsService.list({
      page, limit,
      search:   search   || undefined,
      status:   statusFilter !== 'all' ? statusFilter : undefined,
      date:     dateFilter  || undefined,
      branchId: branchFilter !== 'all' ? branchFilter : undefined,
    }),
    placeholderData: (prev) => prev,
  })

  const { data: detail, isLoading: detailLoading } = useQuery({
    queryKey: ['booking', detailId],
    queryFn:  () => bookingsService.get(detailId!),
    enabled:  !!detailId,
  })

  const { data: branches } = useQuery({
    queryKey: ['branchesSelect'],
    queryFn:  () => branchSelectService.listAll(),
    enabled:  canFetchBranch,
    staleTime: 5 * 60_000,
  })

  const bookings = data?.data ?? []
  const total    = data?.meta.total ?? 0

  // ─── Mutation ────────────────────────────────────────────────────────────────

  const actionMut = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Parameters<typeof bookingsService.action>[1] }) =>
      bookingsService.action(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      if (detailId) queryClient.invalidateQueries({ queryKey: ['booking', detailId] })
      setPendingAction(null)
      setActionError('')
      setCancelReason('')
      setRescheduleDate('')
      setRescheduleTime('')
      setAssignId('')
    },
    onError: (err: ApiError) => setActionError(err.message ?? 'Action failed.'),
  })

  // ─── Action helpers ─────────────────────────────────────────────────────────

  function openAction(type: PendingAction['type'], b: Booking) {
    setActionError('')
    if (type === 'reschedule') {
      setRescheduleDate(b.appointmentDate)
      setRescheduleTime(b.startTime ?? '')
    }
    if (type === 'assign') {
      setAssignId(b.specialist?.id ?? '')
    }
    setPendingAction({ type, id: b.id, reference: b.reference, booking: b })
  }

  function fireAction(body: Parameters<typeof bookingsService.action>[1]) {
    if (!pendingAction) return
    actionMut.mutate({ id: pendingAction.id, body })
  }

  // ─── Columns ────────────────────────────────────────────────────────────────

  const columns: Column<Booking>[] = [
    {
      key: 'reference',
      label: 'Reference',
      render: (r) => <span className="font-mono text-xs text-gold tracking-wide">{r.reference}</span>,
    },
    {
      key: 'customer',
      label: 'Client',
      render: (r) => (
        <div>
          <p className="text-sm font-medium text-admin-text">{r.customer.fullName}</p>
          <p className="text-xs text-admin-muted">{r.customer.email}</p>
        </div>
      ),
    },
    {
      key: 'service',
      label: 'Service',
      render: (r) => (
        <div>
          <p className="text-sm text-admin-text truncate max-w-[160px]">{serviceLabel(r)}</p>
          <p className="text-xs text-admin-muted">{r.specialist?.fullName ?? 'Unassigned'}</p>
        </div>
      ),
    },
    {
      key: 'branch',
      label: 'Branch',
      render: (r) => <span className="text-sm text-admin-text">{r.branch.displayName}</span>,
    },
    {
      key: 'appointmentDate',
      label: 'Date & Time',
      render: (r) => (
        <div>
          <p className="text-sm text-admin-text">{formatDate(r.appointmentDate)}</p>
          <p className="text-xs text-admin-muted">{r.startTime ?? '—'}</p>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r) => <BookingStatusBadge status={r.status} />,
    },
    {
      key: 'actions',
      label: '',
      headerClassName: 'text-right',
      render: (r) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon-sm" title="View details"
            onClick={() => setDetailId(r.id)}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" title="Actions">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {availableActions(r.status).confirm && (
                  <DropdownMenuItem onClick={() => openAction('confirm', r)}>
                    <CheckCircle className="h-3.5 w-3.5 mr-2 text-green-400" />Confirm
                  </DropdownMenuItem>
                )}
                {availableActions(r.status).complete && (
                  <DropdownMenuItem onClick={() => openAction('complete', r)}>
                    <CheckCheck className="h-3.5 w-3.5 mr-2 text-purple-400" />Mark Completed
                  </DropdownMenuItem>
                )}
                {availableActions(r.status).no_show && (
                  <DropdownMenuItem onClick={() => openAction('no_show', r)}>
                    <Clock className="h-3.5 w-3.5 mr-2 text-amber-400" />Mark No Show
                  </DropdownMenuItem>
                )}
                {availableActions(r.status).reschedule && (
                  <DropdownMenuItem onClick={() => openAction('reschedule', r)}>
                    <Calendar className="h-3.5 w-3.5 mr-2 text-blue-400" />Reschedule
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => openAction('assign', r)}>
                  <UserCheck className="h-3.5 w-3.5 mr-2 text-gold" />Assign Specialist
                </DropdownMenuItem>
                {availableActions(r.status).cancel && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem destructive onClick={() => openAction('cancel', r)}>
                      <XCircle className="h-3.5 w-3.5 mr-2" />Cancel Booking
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      ),
    },
  ]

  // ─── Render ──────────────────────────────────────────────────────────────────

  const isFiltered = !!(search || statusFilter !== 'all' || dateFilter || branchFilter !== 'all')

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Bookings"
        description={`${total} total booking${total !== 1 ? 's' : ''}`}
        actions={
          isFetching && !isLoading
            ? <RefreshCw className="h-3.5 w-3.5 text-admin-muted animate-spin" />
            : undefined
        }
      />

      {/* ── Filters ───────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search reference, client, email..."
          icon={<Search className="h-3.5 w-3.5" />}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="max-w-xs"
        />
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-44">
            <Filter className="h-3.5 w-3.5 text-admin-muted mr-1" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">
                {s.replace('_', ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          className="w-40"
          value={dateFilter}
          onChange={(e) => { setDateFilter(e.target.value); setPage(1) }}
        />
        {canFetchBranch && branches && branches.length > 0 && (
          <Select value={branchFilter} onValueChange={(v) => { setBranchFilter(v); setPage(1) }}>
            <SelectTrigger className="w-48">
              <MapPin className="h-3.5 w-3.5 text-admin-muted mr-1" />
              <SelectValue placeholder="Branch" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map((b) => (
                <SelectItem key={b.id} value={b.id}>{b.displayName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* ── Error banner ──────────────────────────────────────────────────── */}
      {isError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 flex items-center gap-3">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-400 flex-1">
            {(error as unknown as ApiError)?.message ?? 'Failed to load bookings.'}
          </p>
          <Button variant="ghost" size="sm" onClick={() => void refetch()}>Retry</Button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={bookings}
        loading={isLoading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1) }}
        emptyTitle="No bookings found"
        emptyDescription={isFiltered ? 'Try adjusting your filters.' : 'Bookings will appear here once created.'}
        isFiltered={isFiltered}
        rowKey={(r) => r.id}
      />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Detail drawer                                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Dialog open={!!detailId} onOpenChange={(o) => !o && setDetailId(null)}>
        <DialogContent size="xl">
          <DialogHeader>
            <div className="flex items-center justify-between pr-8">
              <div>
                <DialogTitle className="font-mono text-gold">{detail?.reference ?? '…'}</DialogTitle>
                <p className="text-xs text-admin-muted mt-0.5">
                  Created {detail ? formatRelative(detail.createdAt) : '…'}
                </p>
              </div>
              {detail && <BookingStatusBadge status={detail.status} />}
            </div>
          </DialogHeader>

          <DialogBody className="space-y-5">
            {detailLoading ? (
              <div className="flex items-center justify-center py-10">
                <RefreshCw className="h-5 w-5 text-admin-muted animate-spin" />
              </div>
            ) : detail ? (
              <>
                {/* ── Info grid ─────────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Customer */}
                  <div className="rounded-lg border border-admin-border bg-admin-card/50 p-4 space-y-2">
                    <p className="text-xs font-semibold text-admin-muted uppercase tracking-wider flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />Customer
                    </p>
                    <p className="text-sm font-medium text-admin-text">{detail.customer.fullName}</p>
                    <p className="text-xs text-admin-muted">{detail.customer.email}</p>
                    {detail.customer.phone && (
                      <p className="text-xs text-admin-muted">{detail.customer.phone}</p>
                    )}
                  </div>

                  {/* Appointment */}
                  <div className="rounded-lg border border-admin-border bg-admin-card/50 p-4 space-y-2">
                    <p className="text-xs font-semibold text-admin-muted uppercase tracking-wider flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />Appointment
                    </p>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      <span className="text-admin-muted text-xs">Date</span>
                      <span className="text-admin-text">{formatDate(detail.appointmentDate)}</span>
                      <span className="text-admin-muted text-xs">Time</span>
                      <span className="text-admin-text">{detail.startTime ?? '—'}</span>
                      <span className="text-admin-muted text-xs">Duration</span>
                      <span className="text-admin-text">{detail.durationMinutes} min</span>
                      <span className="text-admin-muted text-xs">Source</span>
                      <span className="text-admin-text capitalize">{detail.source ?? '—'}</span>
                    </div>
                  </div>

                  {/* Service */}
                  <div className="rounded-lg border border-admin-border bg-admin-card/50 p-4 space-y-2">
                    <p className="text-xs font-semibold text-admin-muted uppercase tracking-wider flex items-center gap-1.5">
                      <Stethoscope className="h-3.5 w-3.5" />Service
                    </p>
                    <p className="text-sm font-medium text-admin-text">{serviceLabel(detail)}</p>
                    {detail.specialist ? (
                      <p className="text-xs text-admin-muted">
                        Specialist: <span className="text-admin-text">{detail.specialist.fullName}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-amber-400">No specialist assigned</p>
                    )}
                  </div>

                  {/* Branch */}
                  <div className="rounded-lg border border-admin-border bg-admin-card/50 p-4 space-y-2">
                    <p className="text-xs font-semibold text-admin-muted uppercase tracking-wider flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />Branch
                    </p>
                    <p className="text-sm font-medium text-admin-text">{detail.branch.displayName}</p>
                    <p className="text-xs text-admin-muted">{detail.branch.city}</p>
                  </div>
                </div>

                {/* Concerns */}
                {detail.concerns && (
                  <div className="rounded-lg border border-admin-border bg-admin-card/50 p-4">
                    <p className="text-xs font-semibold text-admin-muted uppercase tracking-wider mb-2">
                      Client Concerns
                    </p>
                    <p className="text-sm text-admin-text">{detail.concerns}</p>
                  </div>
                )}

                {/* Cancellation reason */}
                {detail.cancelledReason && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                    <p className="text-xs font-semibold text-red-400 uppercase tracking-wider mb-1">
                      Cancellation Reason
                    </p>
                    <p className="text-sm text-admin-text">{detail.cancelledReason}</p>
                  </div>
                )}

                {/* ── Audit timeline ────────────────────────────────────── */}
                {detail.auditEntries.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-admin-muted uppercase tracking-wider mb-3">
                      Booking History
                    </p>
                    <div className="space-y-0">
                      {detail.auditEntries.map((entry, i) => {
                        const meta = AUDIT_STYLE[entry.action] ?? { label: entry.action, dot: 'bg-admin-border' }
                        return (
                          <div key={entry.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${meta.dot}`} />
                              {i < detail.auditEntries.length - 1 && (
                                <div className="w-px flex-1 bg-admin-border mt-1" />
                              )}
                            </div>
                            <div className="pb-4 min-w-0">
                              <p className="text-sm font-medium text-admin-text">{meta.label}</p>
                              {entry.note && (
                                <p className="text-xs text-admin-muted mt-0.5 italic">"{entry.note}"</p>
                              )}
                              <p className="text-xs text-admin-subtle mt-0.5">
                                {entry.actorUser
                                  ? `${entry.actorUser.fullName} (${entry.actorUser.role.replace('_', ' ')})`
                                  : 'System'}
                                {' · '}
                                {formatRelative(entry.createdAt)}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            ) : null}
          </DialogBody>

          {/* Footer: action buttons for non-terminal statuses */}
          {canManage && detail && (
            <DialogFooter className="flex-wrap gap-2">
              <Button variant="secondary" onClick={() => setDetailId(null)}>Close</Button>
              <div className="flex flex-wrap gap-2">
                {availableActions(detail.status).confirm && (
                  <Button size="sm" className="bg-green-600 hover:bg-green-500"
                    onClick={() => openAction('confirm', detail)}>
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />Confirm
                  </Button>
                )}
                {availableActions(detail.status).complete && (
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-500"
                    onClick={() => openAction('complete', detail)}>
                    <CheckCheck className="h-3.5 w-3.5 mr-1" />Complete
                  </Button>
                )}
                {availableActions(detail.status).no_show && (
                  <Button size="sm" variant="secondary"
                    onClick={() => openAction('no_show', detail)}>
                    <Clock className="h-3.5 w-3.5 mr-1" />No Show
                  </Button>
                )}
                {availableActions(detail.status).reschedule && (
                  <Button size="sm" variant="secondary"
                    onClick={() => openAction('reschedule', detail)}>
                    <Calendar className="h-3.5 w-3.5 mr-1" />Reschedule
                  </Button>
                )}
                <Button size="sm" variant="secondary"
                  onClick={() => openAction('assign', detail)}>
                  <UserCheck className="h-3.5 w-3.5 mr-1" />Assign
                </Button>
                {availableActions(detail.status).cancel && (
                  <Button size="sm" variant="destructive"
                    onClick={() => openAction('cancel', detail)}>
                    <XCircle className="h-3.5 w-3.5 mr-1" />Cancel
                  </Button>
                )}
              </div>
            </DialogFooter>
          )}
          {!canManage && (
            <DialogFooter>
              <Button variant="secondary" onClick={() => setDetailId(null)}>Close</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Confirm / Complete / No-Show — simple confirm dialogs              */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <ConfirmDialog
        open={pendingAction?.type === 'confirm'}
        onOpenChange={(o) => !o && setPendingAction(null)}
        title="Confirm Booking"
        description={`Confirm booking ${pendingAction?.reference ?? ''}? The customer will be confirmed for their appointment.`}
        confirmLabel="Confirm Booking"
        variant="default"
        loading={actionMut.isPending}
        onConfirm={() => fireAction({ action: 'confirm' })}
      />
      <ConfirmDialog
        open={pendingAction?.type === 'complete'}
        onOpenChange={(o) => !o && setPendingAction(null)}
        title="Mark as Completed"
        description={`Mark booking ${pendingAction?.reference ?? ''} as completed?`}
        confirmLabel="Mark Completed"
        variant="default"
        loading={actionMut.isPending}
        onConfirm={() => fireAction({ action: 'complete' })}
      />
      <ConfirmDialog
        open={pendingAction?.type === 'no_show'}
        onOpenChange={(o) => !o && setPendingAction(null)}
        title="Mark as No Show"
        description={`Mark booking ${pendingAction?.reference ?? ''} as a no show?`}
        confirmLabel="Mark No Show"
        variant="default"
        loading={actionMut.isPending}
        onConfirm={() => fireAction({ action: 'no_show' })}
      />

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Cancel dialog                                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={pendingAction?.type === 'cancel'}
        onOpenChange={(o) => !o && setPendingAction(null)}
      >
        <DialogContent size="default">
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <p className="text-sm text-admin-muted">
              Cancel booking{' '}
              <span className="font-mono text-gold">{pendingAction?.reference}</span>?
              This cannot be undone.
            </p>
            <div className="space-y-1.5">
              <Label>
                Reason <span className="text-admin-muted text-xs">(optional)</span>
              </Label>
              <Textarea
                placeholder="e.g. Customer requested cancellation..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
              />
            </div>
            {actionError && (
              <p className="text-sm text-red-400 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />{actionError}
              </p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setPendingAction(null)}>
              Keep Booking
            </Button>
            <Button
              variant="destructive"
              loading={actionMut.isPending}
              onClick={() => fireAction({ action: 'cancel', reason: cancelReason || undefined })}
            >
              Cancel Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Reschedule dialog                                                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={pendingAction?.type === 'reschedule'}
        onOpenChange={(o) => !o && setPendingAction(null)}
      >
        <DialogContent size="default">
          <DialogHeader>
            <DialogTitle>Reschedule Booking</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <p className="text-sm text-admin-muted">
              Choose a new date and time for{' '}
              <span className="font-mono text-gold">{pendingAction?.reference}</span>.
              The slot must be available at the booking's branch.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>New Date</Label>
                <Input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>New Time (HH:MM)</Label>
                <Input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                />
              </div>
            </div>
            {actionError && (
              <p className="text-sm text-red-400 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />{actionError}
              </p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setPendingAction(null)}>Cancel</Button>
            <Button
              loading={actionMut.isPending}
              disabled={!rescheduleDate || !rescheduleTime}
              onClick={() => fireAction({
                action: 'reschedule',
                appointmentDate: rescheduleDate,
                startTime: rescheduleTime,
              })}
            >
              <Calendar className="h-3.5 w-3.5 mr-1" />Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* Assign specialist dialog                                            */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={pendingAction?.type === 'assign'}
        onOpenChange={(o) => !o && setPendingAction(null)}
      >
        <DialogContent size="default">
          <DialogHeader>
            <DialogTitle>Assign Specialist</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-4">
            <p className="text-sm text-admin-muted">
              Assign or change the specialist for{' '}
              <span className="font-mono text-gold">{pendingAction?.reference}</span>.
            </p>
            <div className="space-y-1.5">
              <Label>
                Specialist ID
                <span className="ml-1 text-admin-muted text-xs">(numeric — leave blank to unassign)</span>
              </Label>
              <Input
                placeholder="e.g. 3"
                value={assignId}
                onChange={(e) => setAssignId(e.target.value)}
              />
            </div>
            {actionError && (
              <p className="text-sm text-red-400 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />{actionError}
              </p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setPendingAction(null)}>Cancel</Button>
            <Button
              loading={actionMut.isPending}
              onClick={() => fireAction({
                action: 'assign_specialist',
                specialistId: assignId || null,
              })}
            >
              <UserCheck className="h-3.5 w-3.5 mr-1" />Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
