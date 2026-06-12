import React, { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Clock, DollarSign, UploadCloud, RotateCcw } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import PageHeader from '../components/PageHeader'
import DataTable, { type Column } from '../components/DataTable'
import { PublishStatusBadge } from '../components/StatusBadge'
import ConfirmDialog from '../components/ConfirmDialog'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { Textarea } from '../components/ui/textarea'
import { Badge } from '../components/ui/badge'
import { Switch } from '../components/ui/switch'
import { apiClient } from '../lib/apiClient'
import type { Treatment, Category } from '../types'
import { formatCurrency, formatDuration } from '../lib/utils'
import {
  useTreatments,
  useCreateTreatment,
  useUpdateTreatment,
  useDeleteTreatment,
  useRestoreTreatment,
  useUploadTreatmentImage,
} from '../hooks/useTreatments'

const empty: Partial<Treatment> = {
  name: '', slug: '', categoryId: '', shortDescription: '',
  durationMinutes: 60, priceCents: 0, currency: 'USD',
  isPublished: false, displayOrder: 0,
}

export default function Treatments() {
  const [params, setParams] = useState({ page: 1, limit: 10 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')

  const { data: treatmentsRes, isLoading } = useTreatments({
    ...params,
    search: search || undefined,
    categoryId: categoryFilter !== 'all' ? categoryFilter : undefined,
    isPublished: statusFilter === 'published' ? true : statusFilter === 'draft' ? false : undefined,
    includeDeleted: statusFilter === 'archived',
  })

  // Fetch real categories for the dropdowns
  const { data: categoriesRes } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Category[] }>('/admin/categories', { params: { limit: 100 } })
      return data
    },
  })
  const categories = categoriesRes?.data || []

  const createMut = useCreateTreatment()
  const updateMut = useUpdateTreatment()
  const deleteMut = useDeleteTreatment()
  const restoreMut = useRestoreTreatment()
  const uploadMut = useUploadTreatmentImage()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Treatment | null>(null)
  const [form, setForm] = useState<Partial<Treatment>>(empty)
  const [imageFile, setImageFile] = useState<File | null>(null)

  const [deleteId, setDeleteId] = useState<string | null>(null)

  const openAdd = () => { setEditing(null); setForm(empty); setImageFile(null); setFormOpen(true) }
  const openEdit = (t: Treatment) => { setEditing(t); setForm(t); setImageFile(null); setFormOpen(true) }

  const field = (k: keyof Treatment) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    try {
      const payload = { ...form }
      
      // Auto-generate slug if empty
      if (!payload.slug && payload.name) {
        payload.slug = payload.name.toLowerCase().replace(/\s+/g, '-')
      }

      // Ensure numeric fields
      if (payload.priceCents !== undefined) payload.priceCents = Number(payload.priceCents)
      if (payload.durationMinutes !== undefined) payload.durationMinutes = Number(payload.durationMinutes)

      let savedId = editing?.id
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, ...payload })
      } else {
        const created = await createMut.mutateAsync(payload)
        savedId = created.id
      }

      if (imageFile && savedId) {
        await uploadMut.mutateAsync({ id: savedId, file: imageFile })
      }

      setFormOpen(false)
    } catch (err: any) {
      console.error('Failed to save treatment:', err)
      alert(err?.message || 'Failed to save treatment')
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

  const columns: Column<Treatment>[] = [
    {
      key: 'name',
      label: 'Treatment',
      render: (r) => (
        <div className="flex items-center gap-3">
          {r.imageUrl ? (
            <img src={r.imageUrl} alt={r.name} className="h-9 w-9 rounded-lg object-cover shrink-0 border border-admin-border" />
          ) : (
            <div className="h-9 w-9 rounded-lg bg-admin-hover border border-admin-border flex items-center justify-center shrink-0">
              <span className="text-xs text-admin-muted">—</span>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-admin-text">{r.name}</p>
            <p className="text-xs text-admin-muted">/{r.slug}</p>
          </div>
        </div>
      ),
    },
    { key: 'categoryName', label: 'Category', render: (r) => <span className="text-xs text-admin-muted">{r.category?.name || 'Unknown'}</span> },
    { key: 'durationMinutes', label: 'Duration', render: (r) => <span className="text-sm text-admin-text flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-admin-muted" />{formatDuration(r.durationMinutes)}</span> },
    { key: 'priceCents', label: 'Price', render: (r) => <span className="text-sm font-medium text-gold flex items-center gap-1"><DollarSign className="h-3.5 w-3.5 text-admin-muted" />{formatCurrency(r.priceCents / 100)}</span> },
    { key: 'status', label: 'Status', render: (r) => {
      if (r.deletedAt) return <Badge variant="secondary">Archived</Badge>
      return <PublishStatusBadge status={r.isPublished ? 'published' : 'draft'} />
    } },
    {
      key: 'actions', label: '',
      render: (r) => (
        <div className="flex items-center gap-1 justify-end">
          {r.deletedAt ? (
            <Button variant="ghost" size="sm" onClick={() => handleRestore(r.id)} disabled={restoreMut.isPending}><RotateCcw className="h-3.5 w-3.5 mr-1" /> Restore</Button>
          ) : (
            <>
              <Button variant="ghost" size="icon-sm" onClick={() => openEdit(r)}><Edit2 className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon-sm" className="text-red-400 hover:text-red-300" onClick={() => setDeleteId(r.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
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
        title="Treatments"
        description={`${treatmentsRes?.total || 0} treatments available`}
        actions={<Button size="sm" onClick={openAdd}><Plus className="h-3.5 w-3.5" />Add Treatment</Button>}
      />

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search treatments..." icon={<Search className="h-3.5 w-3.5" />} value={search} onChange={(e) => { setSearch(e.target.value); setParams((p) => ({ ...p, page: 1 })) }} className="max-w-xs" />
        <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setParams((p) => ({ ...p, page: 1 })) }}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.displayName}</SelectItem>)}
          </SelectContent>
        </Select>
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
        data={treatmentsRes?.data || []}
        loading={isLoading} total={treatmentsRes?.total || 0} page={params.page} limit={params.limit}
        onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
        onLimitChange={(l) => setParams((prev) => ({ ...prev, limit: l, page: 1 }))}
        emptyTitle="No treatments found" isFiltered={!!(search || statusFilter !== 'all' || categoryFilter !== 'all')}
        rowKey={(r) => r.id}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent size="xl">
          <DialogHeader><DialogTitle>{editing ? 'Edit Treatment' : 'Add Treatment'}</DialogTitle></DialogHeader>
          <DialogBody className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1 space-y-1.5"><Label>Name</Label><Input placeholder="Treatment name" value={form.name ?? ''} onChange={field('name')} /></div>
            <div className="col-span-2 sm:col-span-1 space-y-1.5"><Label>Slug</Label><Input placeholder="treatment-slug" value={form.slug ?? ''} onChange={field('slug')} /></div>
            
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={form.categoryId ?? ''} onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}>
                <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.displayName}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5"><Label>Duration (minutes)</Label><Input type="number" min={15} step={15} value={form.durationMinutes ?? 60} onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))} /></div>
            
            <div className="space-y-1.5"><Label>Price (Cents)</Label><Input type="number" min={0} step={100} value={form.priceCents ?? 0} onChange={(e) => setForm((f) => ({ ...f, priceCents: Number(e.target.value) }))} /></div>
            <div className="space-y-1.5"><Label>Tagline</Label><Input placeholder="Optional tagline" value={form.tagline ?? ''} onChange={field('tagline')} /></div>
            
            <div className="col-span-2 space-y-1.5"><Label>Short Description</Label><Input placeholder="One-line summary" value={form.shortDescription ?? ''} onChange={field('shortDescription')} /></div>
            <div className="col-span-2 space-y-1.5"><Label>Scientific Text</Label><Textarea placeholder="Scientific details..." rows={3} value={form.scientificText ?? ''} onChange={field('scientificText')} /></div>
            <div className="col-span-2 space-y-1.5"><Label>Recovery Text</Label><Input placeholder="e.g. 2-3 days" value={form.recoveryText ?? ''} onChange={field('recoveryText')} /></div>

            <div className="col-span-2 space-y-1.5">
              <Label>Image</Label>
              <div className="flex items-center gap-4">
                {form.imageUrl && !imageFile && (
                  <img src={form.imageUrl} alt="Current" className="h-12 w-12 rounded-lg object-cover border border-admin-border" />
                )}
                <Input 
                  type="file" 
                  accept="image/*" 
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
                  className="file:bg-transparent file:text-admin-text file:text-sm file:font-medium file:border-0"
                />
              </div>
            </div>

            <div className="col-span-2 flex items-center justify-between pt-4 pb-2 border-t border-admin-border">
              <div className="space-y-0.5">
                <Label>Published Status</Label>
                <p className="text-xs text-admin-muted">Toggle visibility on the public site.</p>
              </div>
              <Switch checked={form.isPublished ?? false} onCheckedChange={(c) => setForm((f) => ({ ...f, isPublished: c }))} />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setFormOpen(false)} disabled={createMut.isPending || updateMut.isPending || uploadMut.isPending}>Cancel</Button>
            <Button onClick={handleSave} loading={createMut.isPending || updateMut.isPending || uploadMut.isPending}>
              {editing ? 'Save Changes' : 'Add Treatment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Treatment" description="This will archive the treatment. It will not be permanently removed."
        onConfirm={handleDelete} loading={deleteMut.isPending} confirmLabel="Archive" />
    </div>
  )
}
