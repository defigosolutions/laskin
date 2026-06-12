import React, { useState } from 'react'
import { Plus, Search, Edit2, Trash2, Briefcase, RotateCcw } from 'lucide-react'
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
import { Badge } from '../components/ui/badge'
import type { Specialist } from '../types'
import {
  useSpecialists,
  useCreateSpecialist,
  useUpdateSpecialist,
  useDeleteSpecialist,
  useRestoreSpecialist,
  useUploadSpecialistPortrait,
} from '../hooks/useSpecialists'

const empty: Partial<Specialist> = {
  slug: '', fullName: '', role: '', credential: '', focus: '',
  philosophy: '', isPublished: false, displayOrder: 0,
}

export default function Specialists() {
  const [params, setParams] = useState({ page: 1, limit: 10 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data: specialistsRes, isLoading } = useSpecialists({
    ...params,
    search: search || undefined,
    isPublished: statusFilter === 'published' ? true : statusFilter === 'draft' ? false : undefined,
    includeDeleted: statusFilter === 'archived',
  })

  const createMut = useCreateSpecialist()
  const updateMut = useUpdateSpecialist()
  const deleteMut = useDeleteSpecialist()
  const restoreMut = useRestoreSpecialist()
  const uploadMut = useUploadSpecialistPortrait()

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Specialist | null>(null)
  const [form, setForm] = useState<Partial<Specialist>>(empty)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const openAdd = () => { setEditing(null); setForm(empty); setImageFile(null); setFormOpen(true) }
  const openEdit = (s: Specialist) => { setEditing(s); setForm(s); setImageFile(null); setFormOpen(true) }
  const field = (k: keyof Specialist) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSave = async () => {
    try {
      const payload = { ...form }
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
    } catch (err) {
      console.error('Failed to save specialist:', err)
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

  const columns: Column<Specialist>[] = [
    {
      key: 'fullName',
      label: 'Specialist',
      render: (r) => (
        <div className="flex items-center gap-3">
          {r.portraitUrl ? (
            <img src={r.portraitUrl} alt={r.fullName} className="h-9 w-9 rounded-full object-cover shrink-0 border border-admin-border" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-medium text-gold">{r.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}</span>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-admin-text">{r.fullName}</p>
            <p className="text-xs text-admin-muted">{r.role}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'branches',
      label: 'Branches',
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.branches?.map(b => <Badge key={b.branch.id} variant="secondary" className="text-[10px]">{b.branch.displayName}</Badge>)}
        </div>
      )
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
        title="Specialists"
        description={`${specialistsRes?.total || 0} team members`}
        actions={<Button size="sm" onClick={openAdd}><Plus className="h-3.5 w-3.5" />Add Specialist</Button>}
      />

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search specialists..." icon={<Search className="h-3.5 w-3.5" />} value={search} onChange={(e) => { setSearch(e.target.value); setParams((p) => ({ ...p, page: 1 })) }} className="max-w-xs" />
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setParams((p) => ({ ...p, page: 1 })) }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={specialistsRes?.data || []}
        loading={isLoading} total={specialistsRes?.total || 0} page={params.page} limit={params.limit}
        onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
        onLimitChange={(l) => setParams((prev) => ({ ...prev, limit: l, page: 1 }))}
        emptyTitle="No specialists found" isFiltered={!!(search || statusFilter !== 'all')}
        rowKey={(r) => r.id}
      />

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent size="xl">
          <DialogHeader><DialogTitle>{editing ? 'Edit Specialist' : 'Add Specialist'}</DialogTitle></DialogHeader>
          <DialogBody className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1 space-y-1.5"><Label>Full Name</Label><Input placeholder="Dr. Jane Doe" value={form.fullName ?? ''} onChange={field('fullName')} /></div>
            <div className="col-span-2 sm:col-span-1 space-y-1.5"><Label>Slug</Label><Input placeholder="dr-jane-doe" value={form.slug ?? ''} onChange={field('slug')} /></div>
            
            <div className="col-span-2 sm:col-span-1 space-y-1.5"><Label>Role / Title</Label><Input placeholder="Senior Aesthetic Physician" value={form.role ?? ''} onChange={field('role')} /></div>
            <div className="col-span-2 sm:col-span-1 space-y-1.5"><Label>Credentials</Label><Input placeholder="e.g. MD, FAAD" value={form.credential ?? ''} onChange={field('credential')} /></div>
            
            <div className="col-span-2 space-y-1.5"><Label>Focus</Label><Input placeholder="e.g. Laser Therapy, Injectables" value={form.focus ?? ''} onChange={field('focus')} /></div>
            <div className="col-span-2 space-y-1.5"><Label>Philosophy</Label><Textarea placeholder="Professional bio..." rows={4} value={form.philosophy ?? ''} onChange={field('philosophy')} /></div>

            <div className="col-span-2 space-y-1.5">
              <Label>Portrait Image</Label>
              <div className="flex items-center gap-4">
                {form.portraitUrl && !imageFile && (
                  <img src={form.portraitUrl} alt="Current" className="h-12 w-12 rounded-full object-cover border border-admin-border" />
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
              {editing ? 'Save Changes' : 'Add Specialist'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Specialist" description="This will archive the specialist. It will not be permanently removed."
        onConfirm={handleDelete} loading={deleteMut.isPending} confirmLabel="Archive" />
    </div>
  )
}
