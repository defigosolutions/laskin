import React, { useState } from 'react'
import { Plus, Search, Trash2, Eye, Edit2 } from 'lucide-react'
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
import { Switch } from '../components/ui/switch'
import type { BeforeAfter } from '../types'
import { formatDate } from '../lib/utils'
import {
  useBeforeAfters,
  useCreateBeforeAfter,
  useUpdateBeforeAfter,
  useDeleteBeforeAfter,
  useUploadBeforeImage,
  useUploadAfterImage,
} from '../hooks/useBeforeAfter'

const empty: Partial<BeforeAfter> = {
  slug: '', title: '', subtitle: '', timelineText: '',
  primaryIndications: '', therapistNotes: '', satisfactionText: '',
  ageProfile: '', isPublished: false, displayOrder: 0,
}

export default function BeforeAfterPage() {
  const [params, setParams] = useState({ page: 1, limit: 10 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data: beforeAfterRes, isLoading } = useBeforeAfters({
    ...params,
    search: search || undefined,
    isPublished: statusFilter === 'published' ? true : statusFilter === 'draft' ? false : undefined,
  })

  const createMut = useCreateBeforeAfter()
  const updateMut = useUpdateBeforeAfter()
  const deleteMut = useDeleteBeforeAfter()
  const uploadBeforeMut = useUploadBeforeImage()
  const uploadAfterMut = useUploadAfterImage()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<BeforeAfter | null>(null)
  const [form, setForm] = useState<Partial<BeforeAfter>>(empty)
  const [beforeFile, setBeforeFile] = useState<File | null>(null)
  const [afterFile, setAfterFile] = useState<File | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const [selectedItem, setSelectedItem] = useState<BeforeAfter | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const openAdd = () => { setEditing(null); setForm(empty); setBeforeFile(null); setAfterFile(null); setFormOpen(true) }
  const openEdit = (item: BeforeAfter) => { setEditing(item); setForm(item); setBeforeFile(null); setAfterFile(null); setFormOpen(true) }
  const field = (k: keyof BeforeAfter) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    try {
      const payload = { ...form }
      let savedId = editing?.id
      if (editing) {
        await updateMut.mutateAsync({ id: editing.id, ...payload })
      } else {
        // Mock image urls just to pass schema, replaced by upload immediately
        if (!payload.beforeImageUrl) payload.beforeImageUrl = 'https://placeholder.com/before'
        if (!payload.afterImageUrl) payload.afterImageUrl = 'https://placeholder.com/after'
        const created = await createMut.mutateAsync(payload)
        savedId = created.id
      }
      
      if (savedId) {
        if (beforeFile) await uploadBeforeMut.mutateAsync({ id: savedId, file: beforeFile })
        if (afterFile) await uploadAfterMut.mutateAsync({ id: savedId, file: afterFile })
      }
      setFormOpen(false)
    } catch (err) {
      console.error('Failed to save before/after:', err)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteMut.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const columns: Column<BeforeAfter>[] = [
    {
      key: 'title',
      label: 'Gallery Item',
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="flex gap-1 shrink-0">
            {r.beforeImageUrl ? <img src={r.beforeImageUrl} alt="Before" className="h-10 w-10 rounded-lg object-cover border border-admin-border" /> : <div className="h-10 w-10 bg-admin-surface border border-admin-border rounded-lg" />}
            {r.afterImageUrl ? <img src={r.afterImageUrl} alt="After" className="h-10 w-10 rounded-lg object-cover border border-gold/30" /> : <div className="h-10 w-10 bg-admin-surface border border-admin-border rounded-lg" />}
          </div>
          <div>
            <p className="text-sm font-medium text-admin-text truncate max-w-[180px]">{r.title}</p>
            <p className="text-xs text-admin-muted truncate max-w-[180px]">{r.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'treatment',
      label: 'Treatment',
      render: (r) => <span className="text-sm text-admin-text">{r.treatment?.name || '-'}</span>,
    },
    {
      key: 'date',
      label: 'Added',
      render: (r) => <span className="text-xs text-admin-muted">{formatDate(r.createdAt)}</span>,
    },
    { key: 'status', label: 'Status', render: (r) => <PublishStatusBadge status={r.isPublished ? 'published' : 'draft'} /> },
    {
      key: 'actions', label: '',
      render: (r) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon-sm" onClick={() => { setSelectedItem(r); setDetailOpen(true) }}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => openEdit(r)}>
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
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
        title="Before & After"
        description={`${beforeAfterRes?.total || 0} gallery items`}
        actions={<Button size="sm" onClick={openAdd}><Plus className="h-3.5 w-3.5" />Add Case</Button>}
      />

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search gallery..." icon={<Search className="h-3.5 w-3.5" />} value={search} onChange={(e) => { setSearch(e.target.value); setParams((p) => ({ ...p, page: 1 })) }} className="max-w-xs" />
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setParams((p) => ({ ...p, page: 1 })) }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={beforeAfterRes?.data || []}
        loading={isLoading} total={beforeAfterRes?.total || 0} page={params.page} limit={params.limit}
        onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
        onLimitChange={(l) => setParams((prev) => ({ ...prev, limit: l, page: 1 }))}
        emptyTitle="No gallery items found" isFiltered={!!(search || statusFilter !== 'all')}
        rowKey={(r) => r.id}
      />

      {/* Detail Dialog */}
      {selectedItem && (
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent size="xl">
            <DialogHeader>
              <DialogTitle>{selectedItem.title}</DialogTitle>
            </DialogHeader>
            <DialogBody className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-admin-muted mb-2 uppercase tracking-wider">Before</p>
                  <img src={selectedItem.beforeImageUrl} alt="Before" className="w-full rounded-xl border border-admin-border object-cover aspect-[4/3]" />
                </div>
                <div>
                  <p className="text-xs text-gold mb-2 uppercase tracking-wider">After</p>
                  <img src={selectedItem.afterImageUrl} alt="After" className="w-full rounded-xl border border-gold/30 object-cover aspect-[4/3]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs text-admin-muted mb-0.5">Treatment</p><p className="text-admin-text">{selectedItem.treatment?.name || '-'}</p></div>
                <div><p className="text-xs text-admin-muted mb-0.5">Timeline</p><p className="text-admin-text">{selectedItem.timelineText || '-'}</p></div>
                <div><p className="text-xs text-admin-muted mb-0.5">Date</p><p className="text-admin-text">{formatDate(selectedItem.createdAt)}</p></div>
                <div><p className="text-xs text-admin-muted mb-0.5">Status</p><PublishStatusBadge status={selectedItem.isPublished ? 'published' : 'draft'} /></div>
              </div>
              {selectedItem.therapistNotes && (
                <div>
                  <p className="text-xs text-admin-muted mb-0.5">Notes</p>
                  <p className="text-sm text-admin-text">{selectedItem.therapistNotes}</p>
                </div>
              )}
            </DialogBody>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setDetailOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent size="xl">
          <DialogHeader><DialogTitle>{editing ? 'Edit Case' : 'Add Case'}</DialogTitle></DialogHeader>
          <DialogBody className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1 space-y-1.5"><Label>Title</Label><Input placeholder="Title" value={form.title ?? ''} onChange={field('title')} /></div>
            <div className="col-span-2 sm:col-span-1 space-y-1.5"><Label>Slug</Label><Input placeholder="slug" value={form.slug ?? ''} onChange={field('slug')} /></div>
            
            <div className="col-span-2 sm:col-span-1 space-y-1.5"><Label>Timeline</Label><Input placeholder="e.g. 6 weeks post-treatment" value={form.timelineText ?? ''} onChange={field('timelineText')} /></div>
            <div className="col-span-2 sm:col-span-1 space-y-1.5"><Label>Indications</Label><Input placeholder="e.g. Acne scars" value={form.primaryIndications ?? ''} onChange={field('primaryIndications')} /></div>

            <div className="col-span-2 space-y-1.5"><Label>Therapist Notes</Label><Textarea placeholder="Notes..." rows={3} value={form.therapistNotes ?? ''} onChange={field('therapistNotes')} /></div>

            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <Label>Before Image</Label>
              <Input type="file" accept="image/*" onChange={(e) => setBeforeFile(e.target.files?.[0] || null)} />
              {form.beforeImageUrl && !beforeFile && <img src={form.beforeImageUrl} alt="Before" className="h-20 object-cover mt-2 rounded border border-admin-border" />}
            </div>
            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <Label>After Image</Label>
              <Input type="file" accept="image/*" onChange={(e) => setAfterFile(e.target.files?.[0] || null)} />
              {form.afterImageUrl && !afterFile && <img src={form.afterImageUrl} alt="After" className="h-20 object-cover mt-2 rounded border border-admin-border" />}
            </div>

            <div className="col-span-2 flex items-center justify-between pt-4 pb-2 border-t border-admin-border">
              <Label>Published</Label>
              <Switch checked={form.isPublished ?? false} onCheckedChange={(c) => setForm((f) => ({ ...f, isPublished: c }))} />
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setFormOpen(false)} disabled={createMut.isPending || updateMut.isPending}>Cancel</Button>
            <Button onClick={handleSave} loading={createMut.isPending || updateMut.isPending || uploadBeforeMut.isPending || uploadAfterMut.isPending}>
              {editing ? 'Save Changes' : 'Add Case'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Gallery Item" description="This will permanently delete this before & after entry."
        onConfirm={handleDelete} loading={deleteMut.isPending} confirmLabel="Delete" />
    </div>
  )
}
