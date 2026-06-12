import React, { useState, useRef } from 'react'
import { Trash2, Upload as UploadIcon, Image, FileText, Film, FolderOpen, Grid3X3, List, Link, Eye } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import ConfirmDialog from '../components/ConfirmDialog'
import { Button } from '../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import EmptyState from '../components/EmptyState'
import { LoadingCards } from '../components/LoadingState'
import type { UploadFolder } from '../types'
import { formatFileSize, formatDate } from '../lib/utils'
import { useUploads, useCreateUpload, useDeleteUpload } from '../hooks/useUploads'

const folderOptions: { value: UploadFolder | 'all'; label: string }[] = [
  { value: 'all', label: 'All Folders' },
  { value: 'treatments', label: 'Treatments' },
  { value: 'specialists', label: 'Specialists' },
  { value: 'before-after', label: 'Before & After' },
  { value: 'reviews', label: 'Reviews' },
  { value: 'branches', label: 'Branches' },
  { value: 'general', label: 'General' },
]

function getUploadType(mimeType: string) {
  if (mimeType.startsWith('image/')) return 'image'
  if (mimeType.startsWith('video/')) return 'video'
  return 'document'
}

const typeIcons = {
  image: <Image className="h-4 w-4" />,
  document: <FileText className="h-4 w-4" />,
  video: <Film className="h-4 w-4" />,
}

export default function Uploads() {
  const [params, setParams] = useState({ page: 1, limit: 20 })
  const [folderFilter, setFolderFilter] = useState<UploadFolder | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  const { data: uploadsRes, isLoading } = useUploads({
    ...params,
    folder: folderFilter,
  })

  const uploadMut = useCreateUpload()
  const deleteMut = useDeleteUpload()

  const [deleteId, setDeleteId] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const folder = folderFilter === 'all' ? 'general' : folderFilter
    await uploadMut.mutateAsync({ folder, file })
    if (fileInput.current) fileInput.current.value = ''
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteMut.mutateAsync(deleteId)
    setDeleteId(null)
  }

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url)
  }

  const data = uploadsRes?.data || []
  const total = uploadsRes?.total || 0

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Uploads"
        description={`${total} files in media library`}
        actions={
          <>
            <input ref={fileInput} type="file" className="hidden" onChange={handleUpload} accept="image/*,video/*,.pdf,.doc,.docx" />
            <Button size="sm" onClick={() => fileInput.current?.click()} loading={uploadMut.isPending}>
              <UploadIcon className="h-3.5 w-3.5" />
              Upload to {folderFilter === 'all' ? 'General' : folderFilter}
            </Button>
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <Select value={folderFilter} onValueChange={(v) => { setFolderFilter(v as UploadFolder | 'all'); setParams((p) => ({ ...p, page: 1 })) }}>
          <SelectTrigger className="w-40"><FolderOpen className="h-3.5 w-3.5 text-admin-muted mr-1" /><SelectValue /></SelectTrigger>
          <SelectContent>
            {folderOptions.map((f) => <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>)}
          </SelectContent>
        </Select>
        
        <div className="ml-auto flex items-center gap-1 border border-admin-border rounded-lg p-0.5">
          <button
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-admin-hover text-admin-text' : 'text-admin-muted hover:text-admin-text'}`}
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
          </button>
          <button
            className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-admin-hover text-admin-text' : 'text-admin-muted hover:text-admin-text'}`}
            onClick={() => setViewMode('list')}
          >
            <List className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <LoadingCards count={8} />
      ) : data.length === 0 ? (
        <EmptyState title="No files found" description="Upload files to get started" filtered={folderFilter !== 'all'} />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {data.map((file) => {
            const type = getUploadType(file.mimeType)
            return (
              <div key={file.id} className="group rounded-xl border border-admin-border bg-admin-card overflow-hidden hover:border-gold/30 transition-colors">
                <div className="aspect-square relative bg-admin-surface flex items-center justify-center overflow-hidden group-hover:opacity-90">
                  {type === 'image' ? (
                    <img src={file.publicUrl} alt={file.originalName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-admin-subtle">{typeIcons[type]}</div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button variant="ghost" size="icon-sm" className="text-white hover:bg-white/20" onClick={() => handleCopyUrl(file.publicUrl)} title="Copy URL">
                      <Link className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-white hover:bg-white/20" onClick={() => window.open(file.publicUrl, '_blank')} title="Preview">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon-sm" className="text-red-400 hover:bg-white/20 hover:text-red-300" onClick={() => setDeleteId(file.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-3 space-y-1">
                  <p className="text-xs font-medium text-admin-text truncate" title={file.originalName}>{file.originalName}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px]">{file.folder}</Badge>
                    <span className="text-[10px] text-admin-subtle">{formatFileSize(file.sizeBytes)}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-admin-border bg-admin-card overflow-hidden divide-y divide-admin-border">
          {data.map((file) => {
            const type = getUploadType(file.mimeType)
            return (
              <div key={file.id} className="flex items-center gap-4 px-4 py-3 hover:bg-admin-hover/30 transition-colors">
                <div className="h-10 w-10 rounded-lg bg-admin-surface border border-admin-border flex items-center justify-center shrink-0 overflow-hidden">
                  {type === 'image' ? (
                    <img src={file.publicUrl} alt={file.originalName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-admin-subtle">{typeIcons[type]}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-admin-text truncate">{file.originalName}</p>
                  <p className="text-xs text-admin-muted">{formatDate(file.createdAt)}</p>
                </div>
                <Badge variant="secondary" className="shrink-0">{file.folder}</Badge>
                <span className="text-xs text-admin-muted shrink-0 w-16 text-right">{formatFileSize(file.sizeBytes)}</span>
                <div className="flex items-center gap-1 shrink-0 ml-4">
                  <Button variant="ghost" size="icon-sm" onClick={() => handleCopyUrl(file.publicUrl)} title="Copy URL">
                    <Link className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => window.open(file.publicUrl, '_blank')} title="Preview">
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" className="text-red-400 hover:text-red-300" onClick={() => setDeleteId(file.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {total > params.limit && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <Button variant="secondary" size="sm" disabled={params.page <= 1} onClick={() => setParams((p) => ({ ...p, page: p.page - 1 }))}>
            Previous
          </Button>
          <span className="text-xs text-admin-muted px-2">{params.page} / {Math.ceil(total / params.limit)}</span>
          <Button variant="secondary" size="sm" disabled={params.page >= Math.ceil(total / params.limit)} onClick={() => setParams((p) => ({ ...p, page: p.page + 1 }))}>
            Next
          </Button>
        </div>
      )}

      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete File" description="This will permanently delete this file from the media library. Note: this may break images currently linked on the website."
        onConfirm={handleDelete} loading={deleteMut.isPending} confirmLabel="Delete" />
    </div>
  )
}
