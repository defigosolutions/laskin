import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2, MapPin, Phone, Mail } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable, { type Column } from '../components/DataTable'
import { StatusBadge } from '../components/StatusBadge'
import ConfirmDialog from '../components/ConfirmDialog'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { branchesService } from '../services/api'
import type { Branch, TableParams } from '../types'

const emptyBranch: Partial<Branch> = {
  displayName: '', city: '', addressLine: '', phone: '', email: '',
  isActive: true, timezone: 'America/Los_Angeles',
}

export default function Branches() {
  const [data, setData] = useState<Branch[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [params, setParams] = useState<TableParams>({ page: 1, limit: 10 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Branch | null>(null)
  const [form, setForm] = useState<Partial<Branch>>(emptyBranch)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const isActive = statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined
    const res = await branchesService.list({ ...params, search, isActive })
    setData(res.data)
    setTotal(res.total)
    setLoading(false)
  }, [params, search, statusFilter])

  useEffect(() => { load() }, [load])

  const openAdd = () => { setEditing(null); setForm(emptyBranch); setFormOpen(true) }
  const openEdit = (b: Branch) => { setEditing(b); setForm(b); setFormOpen(true) }
  const field = (k: keyof Branch) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing) await branchesService.update(editing.id, form)
      else await branchesService.create(form)
      setFormOpen(false)
      load()
    } catch (err: any) {
      alert(err?.message || 'Failed to save branch')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleteLoading(true)
    await branchesService.delete(deleteId)
    setDeleteLoading(false)
    setDeleteId(null)
    load()
  }

  const columns: Column<Branch>[] = [
    {
      key: 'displayName',
      label: 'Branch',
      render: (r) => (
        <div>
          <p className="text-sm font-medium text-admin-text">{r.displayName}</p>
          <p className="text-xs text-admin-muted flex items-center gap-1">
            <MapPin className="h-3 w-3" />{r.city}
          </p>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'Contact',
      render: (r) => (
        <div className="space-y-0.5">
          <p className="text-xs text-admin-muted flex items-center gap-1"><Phone className="h-3 w-3" />{r.phone}</p>
          <p className="text-xs text-admin-muted flex items-center gap-1"><Mail className="h-3 w-3" />{r.email}</p>
        </div>
      ),
    },
    { key: 'isActive', label: 'Status', render: (r) => <StatusBadge status={r.isActive ? 'active' : 'inactive'} /> },
    {
      key: 'actions',
      label: '',
      render: (r) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(r)}><Edit2 className="h-3.5 w-3.5" /></Button>
          <Button variant="ghost" size="icon-sm" className="text-red-400 hover:text-red-300" onClick={() => setDeleteId(r.id)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
      headerClassName: 'text-right',
    },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Branches"
        description={`${total} locations worldwide`}
        actions={<Button size="sm" onClick={openAdd}><Plus className="h-3.5 w-3.5" />Add Branch</Button>}
      />

      <div className="flex gap-3">
        <Input placeholder="Search branches..." icon={<Search className="h-3.5 w-3.5" />} value={search} onChange={(e) => { setSearch(e.target.value); setParams((p) => ({ ...p, page: 1 })) }} className="max-w-xs" />
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setParams((p) => ({ ...p, page: 1 })) }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading} total={total} page={params.page} limit={params.limit}
        onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
        onLimitChange={(l) => setParams((prev) => ({ ...prev, limit: l, page: 1 }))}
        emptyTitle="No branches found" isFiltered={!!(search || statusFilter !== 'all')}
        rowKey={(r) => r.id}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent size="lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit Branch' : 'Add Branch'}</DialogTitle></DialogHeader>
          <DialogBody className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Branch Name</Label><Input placeholder="e.g. Beverly Hills Flagship" value={form.displayName ?? ''} onChange={field('displayName')} /></div>
            <div className="space-y-1.5"><Label>City</Label><Input placeholder="City" value={form.city ?? ''} onChange={field('city')} /></div>
            <div className="col-span-2 space-y-1.5"><Label>Address</Label><Input placeholder="Full address" value={form.addressLine ?? ''} onChange={field('addressLine')} /></div>
            <div className="space-y-1.5"><Label>Phone</Label><Input placeholder="+1 310 555 0000" value={form.phone ?? ''} onChange={field('phone')} /></div>
            <div className="space-y-1.5"><Label>Email</Label><Input placeholder="branch@laskin.com" type="email" value={form.email ?? ''} onChange={field('email')} /></div>
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={form.isActive ? 'active' : 'inactive'} onValueChange={(v) => setForm((f) => ({ ...f, isActive: v === 'active' }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Timezone</Label><Input placeholder="America/Los_Angeles" value={form.timezone ?? ''} onChange={field('timezone')} /></div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editing ? 'Save Changes' : 'Add Branch'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Branch" description="This will permanently delete this branch and all associated data."
        onConfirm={handleDelete} loading={deleteLoading} confirmLabel="Delete" />
    </div>
  )
}
