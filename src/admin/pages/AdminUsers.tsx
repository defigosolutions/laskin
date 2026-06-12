import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Shield, Mail, RefreshCw, KeyRound, ToggleLeft, ToggleRight, Edit2, AlertCircle } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable, { type Column } from '../components/DataTable'
import { StatusBadge, RoleBadge } from '../components/StatusBadge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { adminUsersService } from '../services/api'
import { useAuth } from '../hooks/useAuth'
import type { AdminUser, AdminRole } from '../types'
import { formatRelative, formatDate } from '../lib/utils'
import type { ApiError } from '../lib/apiClient'

const ROLES: AdminRole[] = ['super_admin', 'clinic_manager', 'specialist', 'concierge']

interface CreateForm {
  email: string
  password: string
  fullName: string
  role: AdminRole
  branchId: string
}

interface EditForm {
  fullName: string
  email: string
  branchId: string
  role: AdminRole
}

const emptyCreate: CreateForm = { email: '', password: '', fullName: '', role: 'concierge', branchId: '' }

export default function AdminUsers() {
  const queryClient = useQueryClient()
  const { user: me } = useAuth()
  const isSuperAdmin = me?.role === 'super_admin'

  const [page, setPage]         = useState(1)
  const [limit, setLimit]       = useState(10)
  const [roleFilter, setRoleFilter]     = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  // Create modal
  const [createOpen, setCreateOpen] = useState(false)
  const [createForm, setCreateForm] = useState<CreateForm>(emptyCreate)
  const [createError, setCreateError] = useState('')

  // Edit modal
  const [editOpen, setEditOpen]     = useState(false)
  const [editTarget, setEditTarget] = useState<AdminUser | null>(null)
  const [editForm, setEditForm]     = useState<EditForm>({ fullName: '', email: '', branchId: '', role: 'concierge' })
  const [editError, setEditError]   = useState('')

  // Reset password modal
  const [resetOpen, setResetOpen]       = useState(false)
  const [resetTarget, setResetTarget]   = useState<AdminUser | null>(null)
  const [newPassword, setNewPassword]   = useState('')
  const [confirmPw, setConfirmPw]       = useState('')
  const [resetError, setResetError]     = useState('')

  // ─── Query ─────────────────────────────────────────────────────────────────

  const queryKey = ['adminUsers', page, limit, roleFilter, statusFilter] as const

  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey,
    queryFn: () => adminUsersService.list({
      page,
      limit,
      role:     roleFilter !== 'all' ? roleFilter : undefined,
      isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
    }),
    placeholderData: (prev) => prev,
  })

  const users = data?.data ?? []
  const total = data?.meta.total ?? 0

  // ─── Mutations ─────────────────────────────────────────────────────────────

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['adminUsers'] })

  const createMutation = useMutation({
    mutationFn: (form: CreateForm) => adminUsersService.create({
      email:    form.email,
      password: form.password,
      fullName: form.fullName,
      role:     form.role,
      branchId: form.branchId || null,
    }),
    onSuccess: () => {
      invalidate()
      setCreateOpen(false)
      setCreateForm(emptyCreate)
      setCreateError('')
    },
    onError: (err: ApiError) => setCreateError(err.message),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ target, form }: { target: AdminUser; form: EditForm }) => {
      const roleChanged = form.role !== target.role
      const infoChanged =
        form.fullName !== target.fullName ||
        form.email    !== target.email    ||
        (form.branchId || null) !== target.branchId

      if (roleChanged) await adminUsersService.updateRole(target.id, form.role)
      if (infoChanged) {
        await adminUsersService.update(target.id, {
          fullName: form.fullName !== target.fullName ? form.fullName : undefined,
          email:    form.email    !== target.email    ? form.email    : undefined,
          branchId: (form.branchId || null) !== target.branchId ? (form.branchId || null) : undefined,
        })
      }
    },
    onSuccess: () => {
      invalidate()
      setEditOpen(false)
      setEditError('')
    },
    onError: (err: ApiError) => setEditError(err.message),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminUsersService.updateStatus(id, isActive),
    onSuccess: invalidate,
  })

  const resetMutation = useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      adminUsersService.resetPassword(id, password),
    onSuccess: () => {
      setResetOpen(false)
      setNewPassword('')
      setConfirmPw('')
      setResetError('')
    },
    onError: (err: ApiError) => setResetError(err.message),
  })

  // ─── Handlers ──────────────────────────────────────────────────────────────

  function openEdit(u: AdminUser) {
    setEditTarget(u)
    setEditForm({ fullName: u.fullName, email: u.email, branchId: u.branchId ?? '', role: u.role })
    setEditError('')
    setEditOpen(true)
  }

  function openReset(u: AdminUser) {
    setResetTarget(u)
    setNewPassword('')
    setConfirmPw('')
    setResetError('')
    setResetOpen(true)
  }

  function handleReset() {
    if (!resetTarget) return
    if (newPassword !== confirmPw) { setResetError('Passwords do not match.'); return }
    if (newPassword.length < 8)   { setResetError('Password must be at least 8 characters.'); return }
    resetMutation.mutate({ id: resetTarget.id, password: newPassword })
  }

  // ─── Columns ───────────────────────────────────────────────────────────────

  const actionColumn: Column<AdminUser> = {
    key: 'actions',
    label: '',
    headerClassName: 'text-right',
    render: (r) => (
      <div className="flex items-center gap-1 justify-end">
        <Button variant="ghost" size="icon-sm" title="Edit user" onClick={() => openEdit(r)}>
          <Edit2 className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon-sm" title="Reset password" onClick={() => openReset(r)}>
          <KeyRound className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost" size="icon-sm"
          title={r.isActive ? 'Deactivate' : 'Activate'}
          className={r.isActive ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'}
          disabled={statusMutation.isPending}
          onClick={() => statusMutation.mutate({ id: r.id, isActive: !r.isActive })}
        >
          {r.isActive
            ? <ToggleRight className="h-4 w-4" />
            : <ToggleLeft  className="h-4 w-4" />}
        </Button>
      </div>
    ),
  }

  const columns: Column<AdminUser>[] = [
    {
      key: 'fullName',
      label: 'User',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-admin-hover border border-admin-border flex items-center justify-center shrink-0">
            <span className="text-xs font-medium text-admin-muted">
              {r.fullName.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-admin-text">{r.fullName}</p>
            <p className="text-xs text-admin-muted flex items-center gap-1">
              <Mail className="h-3 w-3" />{r.email}
            </p>
          </div>
        </div>
      ),
    },
    { key: 'role',     label: 'Role',   render: (r) => <RoleBadge role={r.role} /> },
    { key: 'isActive', label: 'Status', render: (r) => <StatusBadge status={r.isActive ? 'active' : 'inactive'} /> },
    {
      key: 'lastLoginAt',
      label: 'Last Login',
      render: (r) => (
        <span className="text-xs text-admin-muted">
          {r.lastLoginAt ? formatRelative(r.lastLoginAt) : 'Never'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Created',
      render: (r) => <span className="text-xs text-admin-muted">{formatDate(r.createdAt)}</span>,
    },
    ...(isSuperAdmin ? [actionColumn] : []),
  ]

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Admin Users"
        description={`${total} admin account${total !== 1 ? 's' : ''}`}
        actions={
          <div className="flex items-center gap-2">
            {isFetching && !isLoading && <RefreshCw className="h-3.5 w-3.5 text-admin-muted animate-spin" />}
            {isSuperAdmin && (
              <Button size="sm" onClick={() => { setCreateForm(emptyCreate); setCreateError(''); setCreateOpen(true) }}>
                <Plus className="h-3.5 w-3.5" />Add User
              </Button>
            )}
          </div>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(1) }}>
          <SelectTrigger className="w-44">
            <Shield className="h-3.5 w-3.5 text-admin-muted mr-1" />
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {ROLES.map((r) => (
              <SelectItem key={r} value={r} className="capitalize">{r.replace(/_/g, ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error banner */}
      {isError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 flex items-center gap-3">
          <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
          <p className="text-sm text-red-400 flex-1">
            {(error as unknown as ApiError)?.message ?? 'Failed to load admin users.'}
          </p>
          <Button variant="ghost" size="sm" onClick={() => void refetch()}>Retry</Button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={users}
        loading={isLoading}
        total={total}
        page={page}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(l) => { setLimit(l); setPage(1) }}
        emptyTitle="No admin users found"
        emptyDescription={roleFilter !== 'all' || statusFilter !== 'all' ? 'Try adjusting the filters.' : undefined}
        isFiltered={roleFilter !== 'all' || statusFilter !== 'all'}
        rowKey={(r) => r.id}
      />

      {/* ── Create modal ──────────────────────────────────────────────────── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent size="lg">
          <DialogHeader><DialogTitle>Add Admin User</DialogTitle></DialogHeader>
          <DialogBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input placeholder="Jane Doe" value={createForm.fullName}
                  onChange={(e) => setCreateForm((f) => ({ ...f, fullName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" placeholder="jane@laskin.com" value={createForm.email}
                  onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input type="password" placeholder="Min 8 chars, A–Z, a–z, 0–9, symbol" value={createForm.password}
                  onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={createForm.role}
                  onValueChange={(v) => setCreateForm((f) => ({ ...f, role: v as AdminRole }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r} className="capitalize">{r.replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 col-span-2">
                <Label>
                  Branch ID
                  <span className="ml-1 text-xs text-admin-muted">(numeric — required for clinic_manager)</span>
                </Label>
                <Input placeholder="e.g. 1" value={createForm.branchId}
                  onChange={(e) => setCreateForm((f) => ({ ...f, branchId: e.target.value }))} />
              </div>
            </div>
            {createError && (
              <p className="text-sm text-red-400 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />{createError}
              </p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              loading={createMutation.isPending}
              disabled={!createForm.email || !createForm.password || !createForm.fullName}
              onClick={() => createMutation.mutate(createForm)}
            >
              Add User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit modal ────────────────────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent size="lg">
          <DialogHeader><DialogTitle>Edit Admin User</DialogTitle></DialogHeader>
          <DialogBody className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input value={editForm.fullName}
                  onChange={(e) => setEditForm((f) => ({ ...f, fullName: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" value={editForm.email}
                  onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select value={editForm.role}
                  onValueChange={(v) => setEditForm((f) => ({ ...f, role: v as AdminRole }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r} value={r} className="capitalize">{r.replace(/_/g, ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>
                  Branch ID
                  <span className="ml-1 text-xs text-admin-muted">(leave blank to unassign)</span>
                </Label>
                <Input placeholder="e.g. 1" value={editForm.branchId}
                  onChange={(e) => setEditForm((f) => ({ ...f, branchId: e.target.value }))} />
              </div>
            </div>
            {editError && (
              <p className="text-sm text-red-400 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />{editError}
              </p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button
              loading={updateMutation.isPending}
              disabled={!editForm.fullName || !editForm.email}
              onClick={() => editTarget && updateMutation.mutate({ target: editTarget, form: editForm })}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Reset password modal ──────────────────────────────────────────── */}
      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset Password</DialogTitle></DialogHeader>
          <DialogBody className="space-y-4">
            <p className="text-sm text-admin-muted">
              Setting a new password for{' '}
              <span className="font-medium text-admin-text">{resetTarget?.fullName}</span>.
              All active sessions for this user will be invalidated.
            </p>
            <div className="space-y-1.5">
              <Label>New Password</Label>
              <Input type="password" value={newPassword}
                placeholder="Min 8 chars, A–Z, a–z, 0–9, symbol"
                onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Confirm Password</Label>
              <Input type="password" value={confirmPw}
                placeholder="Re-enter new password"
                onChange={(e) => setConfirmPw(e.target.value)} />
            </div>
            {resetError && (
              <p className="text-sm text-red-400 flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />{resetError}
              </p>
            )}
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setResetOpen(false)}>Cancel</Button>
            <Button
              loading={resetMutation.isPending}
              disabled={!newPassword || !confirmPw}
              onClick={handleReset}
            >
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
