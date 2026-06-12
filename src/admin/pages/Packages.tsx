import React, { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Tag, RotateCcw } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable, { type Column } from '../components/DataTable'
import { PublishStatusBadge } from '../components/StatusBadge'
import ConfirmDialog from '../components/ConfirmDialog'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { Switch } from '../components/ui/switch'
import { Badge } from '../components/ui/badge'
import type { Package } from '../types'
import { formatCurrency } from '../lib/utils'
import {
  usePackages,
  useCreatePackage,
  useUpdatePackage,
  useDeletePackage,
  useRestorePackage,
} from '../hooks/usePackages'

const empty: Partial<Package> = {
  slug: '', name: '', tagline: '', badge: '',
  priceCents: 0, valuePriceCents: 0, isPublished: false, displayOrder: 0,
}

export default function Packages() {
  const [params, setParams] = useState({ page: 1, limit: 10 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data: packagesRes, isLoading } = usePackages({
    ...params,
    search: search || undefined,
    isPublished: statusFilter === 'published' ? true : statusFilter === 'draft' ? false : undefined,
    includeDeleted: statusFilter === 'archived',
  })

  const createMut = useCreatePackage()
  const updateMut = useUpdatePackage()
  const deleteMut = useDeletePackage()
  const restoreMut = useRestorePackage()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Package | null>(null)
  const [form, setForm] = useState<Partial<Package>>(empty)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const openAdd = () => { setEditing(null); setForm(empty); setFormOpen(true) }
  const openEdit = (p: Package) => { setEditing(p); setForm(p); setFormOpen(true) }
  const field = (k: keyof Package) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    try {
      const payload = { ...form }
      if (payload.priceCents) payload.priceCents = Number(payload.priceCents)
      if (payload.valuePriceCents) payload.valuePriceCents = Number(payload.valuePriceCents)

      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, ...payload })
      } else {
        await createMut.mutateAsync(payload)
      }
      setFormOpen(false)
    } catch (err) {
      console.error('Failed to save package:', err)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteMut.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const handleRestore = async (id: string) => {
    await restoreMut.mutateAsync(id)
  }

  const columns: Column<Package>[] = [
    {
      key: 'name',
      label: 'Package',
      render: (r) => (
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-admin-text">{r.name}</p>
            {r.badge && <Badge variant="default" className="text-[10px] py-0">{r.badge}</Badge>}
          </div>
          <p className="text-xs text-admin-muted truncate max-w-[200px]">{r.slug}</p>
        </div>
      ),
    },
    {
      key: 'priceCents',
      label: 'Price',
      render: (r) => (
        <div>
          <p className="text-sm font-medium text-gold">{formatCurrency(r.priceCents / 100)}</p>
          {(r.valuePriceCents && r.valuePriceCents > r.priceCents) ? (
            <p className="text-xs text-admin-muted line-through">{formatCurrency(r.valuePriceCents / 100)}</p>
          ) : null}
        </div>
      ),
    },
    { key: 'status', label: 'Status', render: (r) => {
      if (r.deletedAt) return <Badge variant="secondary">Archived</Badge>
      return <PublishStatusBadge status={r.isPublished ? 'published' : 'draft'} />
    } },
    {
      key: 'actions', label: '',
      render: (r) => (
        <div className="flex items-center gap-1 justify-end">
          {r.deletedAt ? (
            <Button variant="ghost" size="sm" onClick={() => handleRestore(r.id)} disabled={restoreMut.isPending}>
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Restore
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="icon-sm" onClick={() => openEdit(r)}><Edit2 className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon-sm" className="text-red-400 hover:text-red-300" onClick={() => setDeleteId(r.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </div>
      ),
      headerClassName: 'text-right',
    },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Packages"
        description={`${packagesRes?.total || 0} treatment packages`}
        actions={<Button size="sm" onClick={openAdd}><Plus className="h-3.5 w-3.5" />Add Package</Button>}
      />

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search packages..." icon={<Search className="h-3.5 w-3.5" />} value={search} onChange={(e) => { setSearch(e.target.value); setParams((p) => ({ ...p, page: 1 })) }} className="max-w-xs" />
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setParams((p) => ({ ...p, page: 1 })) }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={packagesRes?.data || []}
        loading={isLoading} total={packagesRes?.total || 0} page={params.page} limit={params.limit}
        onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
        onLimitChange={(l) => setParams((prev) => ({ ...prev, limit: l, page: 1 }))}
        emptyTitle="No packages found" isFiltered={!!(search || statusFilter !== 'all')}
        rowKey={(r) => r.id}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent size="xl">
          <DialogHeader><DialogTitle>{editing ? 'Edit Package' : 'Add Package'}</DialogTitle></DialogHeader>
          <DialogBody className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1 space-y-1.5"><Label>Package Name</Label><Input placeholder="e.g. The Clarity Edit" value={form.name ?? ''} onChange={field('name')} /></div>
            <div className="col-span-2 sm:col-span-1 space-y-1.5"><Label>Slug</Label><Input placeholder="package-slug" value={form.slug ?? ''} onChange={field('slug')} /></div>
            
            <div className="col-span-2 space-y-1.5"><Label>Tagline</Label><Input placeholder="One-line summary" value={form.tagline ?? ''} onChange={field('tagline')} /></div>
            
            <div className="space-y-1.5"><Label>Price (Cents)</Label><Input type="number" min={0} step={100} value={form.priceCents ?? 0} onChange={(e) => setForm((f) => ({ ...f, priceCents: Number(e.target.value) }))} /></div>
            <div className="space-y-1.5"><Label>Value Price (Cents)</Label><Input type="number" min={0} step={100} value={form.valuePriceCents ?? 0} onChange={(e) => setForm((f) => ({ ...f, valuePriceCents: Number(e.target.value) }))} /></div>
            
            <div className="col-span-2 space-y-1.5"><Label>Badge</Label><Input placeholder="e.g. Most Popular" value={form.badge ?? ''} onChange={field('badge')} /></div>
            
            <div className="col-span-2 flex items-center justify-between pt-4 pb-2 border-t border-admin-border">
              <div className="space-y-0.5">
                <Label>Published Status</Label>
                <p className="text-xs text-admin-muted">Toggle visibility on the public site.</p>
              </div>
              <Switch checked={form.isPublished ?? false} onCheckedChange={(c) => setForm((f) => ({ ...f, isPublished: c }))} />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setFormOpen(false)} disabled={createMut.isPending || updateMut.isPending}>Cancel</Button>
            <Button onClick={handleSave} loading={createMut.isPending || updateMut.isPending}>
              {editing ? 'Save Changes' : 'Add Package'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Package" description="This will archive the package. It will not be permanently removed."
        onConfirm={handleDelete} loading={deleteMut.isPending} confirmLabel="Archive" />
    </div>
  )
}
