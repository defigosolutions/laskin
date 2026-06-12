import React, { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2, GripVertical } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable, { type Column } from '../components/DataTable'
import { StatusBadge } from '../components/StatusBadge'
import ConfirmDialog from '../components/ConfirmDialog'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { categoriesService } from '../services/api'
import type { Category, TableParams } from '../types'

const empty: Partial<Category> = {
  displayName: '', slug: '', isActive: true, displayOrder: 99,
}

export default function Categories() {
  const [data, setData] = useState<Category[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [params, setParams] = useState<TableParams>({ page: 1, limit: 20 })
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState<Partial<Category>>(empty)
  const [saving, setSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const res = await categoriesService.list({ ...params, search })
    setData(res.data)
    setTotal(res.total)
    setLoading(false)
  }, [params, search])

  useEffect(() => { load() }, [load])

  const openAdd = () => { setEditing(null); setForm(empty); setFormOpen(true) }
  const openEdit = (c: Category) => { setEditing(c); setForm(c); setFormOpen(true) }
  const field = (k: keyof Category) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      if (editing) await categoriesService.update(editing.id, form)
      else await categoriesService.create(form)
      setFormOpen(false)
      load()
    } catch (err: any) {
      alert(err?.message || 'Failed to save category')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setDeleteLoading(true)
    await categoriesService.delete(deleteId)
    setDeleteLoading(false)
    setDeleteId(null)
    load()
  }

  const columns: Column<Category>[] = [
    {
      key: 'displayOrder',
      label: '#',
      render: (r) => (
        <div className="flex items-center gap-2">
          <GripVertical className="h-3.5 w-3.5 text-admin-subtle cursor-grab" />
          <span className="text-xs font-mono text-admin-muted">{r.displayOrder}</span>
        </div>
      ),
    },
    {
      key: 'displayName',
      label: 'Category',
      render: (r) => <p className="text-sm font-medium text-admin-text">{r.displayName}</p>,
    },
    {
      key: 'slug',
      label: 'Slug',
      render: (r) => <span className="font-mono text-xs text-admin-muted">{r.slug}</span>,
    },
    { key: 'isActive', label: 'Status', render: (r) => <StatusBadge status={r.isActive ? 'active' : 'inactive'} /> },
    {
      key: 'actions', label: '',
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
        title="Categories"
        description={`${total} treatment categories`}
        actions={<Button size="sm" onClick={openAdd}><Plus className="h-3.5 w-3.5" />Add Category</Button>}
      />

      <div className="flex gap-3">
        <Input placeholder="Search categories..." icon={<Search className="h-3.5 w-3.5" />} value={search} onChange={(e) => { setSearch(e.target.value); setParams((p) => ({ ...p, page: 1 })) }} className="max-w-xs" />
      </div>

      <DataTable
        columns={columns}
        data={data}
        loading={loading} total={total} page={params.page} limit={params.limit}
        onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
        onLimitChange={(l) => setParams((prev) => ({ ...prev, limit: l, page: 1 }))}
        emptyTitle="No categories found" isFiltered={!!search}
        rowKey={(r) => r.id}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent size="lg">
          <DialogHeader><DialogTitle>{editing ? 'Edit Category' : 'Add Category'}</DialogTitle></DialogHeader>
          <DialogBody className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Name</Label><Input placeholder="Category name" value={form.displayName ?? ''} onChange={field('displayName')} /></div>
            <div className="space-y-1.5"><Label>Slug</Label><Input placeholder="category-slug" value={form.slug ?? ''} onChange={field('slug')} /></div>
            <div className="space-y-1.5"><Label>Sort Order</Label><Input type="number" min={1} value={form.displayOrder ?? 99} onChange={(e) => setForm((f) => ({ ...f, displayOrder: Number(e.target.value) }))} /></div>
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
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editing ? 'Save Changes' : 'Add Category'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Category" description="This will permanently delete this category. Treatments in this category will become uncategorised."
        onConfirm={handleDelete} loading={deleteLoading} confirmLabel="Delete" />
    </div>
  )
}
