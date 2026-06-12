import React, { useState } from 'react'
import { Search, Trash2, Eye, CheckCircle, XCircle, Star, ThumbsUp } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable, { type Column } from '../components/DataTable'
import { StatusBadge, StarRating } from '../components/StatusBadge'
import ConfirmDialog from '../components/ConfirmDialog'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from '../components/ui/dialog'
import { Badge } from '../components/ui/badge'
import type { Review } from '../types'
import { formatDate } from '../lib/utils'
import {
  useReviews,
  useUpdateReview,
  useDeleteReview,
} from '../hooks/useReviews'

export default function Reviews() {
  const [params, setParams] = useState({ page: 1, limit: 10 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const { data: reviewsRes, isLoading } = useReviews({
    ...params,
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  })

  const updateMut = useUpdateReview()
  const deleteMut = useDeleteReview()

  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleApprove = async (id: string) => {
    await updateMut.mutateAsync({ id, status: 'approved' })
  }

  const handleReject = async (id: string) => {
    await updateMut.mutateAsync({ id, status: 'rejected' })
  }

  const handleToggleFeatured = async (review: Review) => {
    await updateMut.mutateAsync({ id: review.id, isFeatured: !review.isFeatured })
  }

  const handleDelete = async () => {
    if (!deleteId) return
    await deleteMut.mutateAsync(deleteId)
    setDeleteId(null)
    setDetailOpen(false)
  }

  const columns: Column<Review>[] = [
    {
      key: 'authorName',
      label: 'Client',
      render: (r) => (
        <div>
          <p className="text-sm font-medium text-admin-text">{r.authorName}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <StarRating rating={r.rating} />
          </div>
        </div>
      ),
    },
    {
      key: 'quote',
      label: 'Review',
      render: (r) => (
        <div>
          <p className="text-sm text-admin-muted truncate max-w-[300px]">{r.quote.slice(0, 80)}...</p>
        </div>
      ),
    },
    {
      key: 'branch',
      label: 'Branch',
      render: (r) => <span className="text-xs text-admin-muted">{r.branch?.displayName ?? '—'}</span>,
    },
    {
      key: 'createdAt',
      label: 'Date',
      render: (r) => <span className="text-xs text-admin-muted">{formatDate(r.createdAt)}</span>,
    },
    { key: 'status', label: 'Status', render: (r) => <StatusBadge status={r.status} /> },
    {
      key: 'actions', label: '',
      render: (r) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="icon-sm" onClick={() => { setSelectedReview(r); setDetailOpen(true) }}>
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon-sm" onClick={() => handleToggleFeatured(r)} title={r.isFeatured ? 'Unfeature' : 'Feature'}>
            <Star className={`h-3.5 w-3.5 ${r.isFeatured ? 'text-gold fill-gold' : ''}`} />
          </Button>
          {r.status === 'pending' && (
            <>
              <Button variant="ghost" size="icon-sm" className="text-green-400 hover:text-green-300" onClick={() => handleApprove(r.id)}>
                <CheckCircle className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon-sm" className="text-red-400 hover:text-red-300" onClick={() => handleReject(r.id)}>
                <XCircle className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
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
        title="Reviews"
        description={`${reviewsRes?.total || 0} client reviews`}
      />

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search reviews..." icon={<Search className="h-3.5 w-3.5" />} value={search} onChange={(e) => { setSearch(e.target.value); setParams((p) => ({ ...p, page: 1 })) }} className="max-w-xs" />
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setParams((p) => ({ ...p, page: 1 })) }}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={reviewsRes?.data || []}
        loading={isLoading} total={reviewsRes?.total || 0} page={params.page} limit={params.limit}
        onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
        onLimitChange={(l) => setParams((prev) => ({ ...prev, limit: l, page: 1 }))}
        emptyTitle="No reviews found" isFiltered={!!(search || statusFilter !== 'all')}
        rowKey={(r) => r.id}
      />

      {/* Detail Dialog */}
      {selectedReview && (
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent size="lg">
            <DialogHeader>
              <DialogTitle>Review by {selectedReview.authorName}</DialogTitle>
            </DialogHeader>
            <DialogBody className="space-y-4">
              <div className="flex items-center gap-3">
                <StarRating rating={selectedReview.rating} />
                <StatusBadge status={selectedReview.status} />
              </div>
              <div>
                <p className="text-sm text-admin-muted leading-relaxed">{selectedReview.quote}</p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {selectedReview.branch && <div><p className="text-xs text-admin-muted mb-0.5">Branch</p><p className="text-admin-text">{selectedReview.branch.displayName}</p></div>}
                <div><p className="text-xs text-admin-muted mb-0.5">Date</p><p className="text-admin-text">{formatDate(selectedReview.createdAt)}</p></div>
              </div>
            </DialogBody>
            <DialogFooter>
              <Button variant="secondary" onClick={() => setDetailOpen(false)}>Close</Button>
              <Button variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => setDeleteId(selectedReview.id)}>Delete Review</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <ConfirmDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}
        title="Delete Review" description="This will permanently delete this review."
        onConfirm={handleDelete} loading={deleteMut.isPending} confirmLabel="Delete" />
    </div>
  )
}
