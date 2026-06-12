import { Badge } from './ui/badge'
import type { BookingStatus } from '../types'

const bookingStatusMap: Record<BookingStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'secondary' | 'purple' }> = {
  pending:     { label: 'Pending',     variant: 'warning' },
  confirmed:   { label: 'Confirmed',   variant: 'success' },
  rescheduled: { label: 'Rescheduled', variant: 'info' },
  completed:   { label: 'Completed',   variant: 'purple' },
  cancelled:   { label: 'Cancelled',   variant: 'error' },
  no_show:     { label: 'No Show',     variant: 'secondary' },
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const cfg = bookingStatusMap[status] ?? { label: status, variant: 'secondary' as const }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

const publishStatusMap: Record<string, { label: string; variant: 'success' | 'warning' | 'secondary' }> = {
  published: { label: 'Published', variant: 'success' },
  draft:     { label: 'Draft',     variant: 'warning' },
  archived:  { label: 'Archived',  variant: 'secondary' },
}

export function PublishStatusBadge({ status }: { status: string }) {
  const cfg = publishStatusMap[status] ?? { label: status, variant: 'secondary' as const }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

const generalStatusMap: Record<string, { label: string; variant: 'success' | 'error' | 'warning' | 'info' | 'secondary' }> = {
  active:      { label: 'Active',      variant: 'success' },
  inactive:    { label: 'Inactive',    variant: 'secondary' },
  suspended:   { label: 'Suspended',   variant: 'error' },
  coming_soon: { label: 'Coming Soon', variant: 'warning' },
  pending:     { label: 'Pending',     variant: 'warning' },
  approved:    { label: 'Approved',    variant: 'success' },
  rejected:    { label: 'Rejected',    variant: 'error' },
  published:   { label: 'Published',   variant: 'success' },
}

export function StatusBadge({ status }: { status: string }) {
  const cfg = generalStatusMap[status] ?? { label: status, variant: 'secondary' as const }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

export function RoleBadge({ role }: { role: string }) {
  const roleMap: Record<string, { label: string; variant: 'default' | 'info' | 'success' | 'secondary' }> = {
    super_admin:    { label: 'Super Admin',    variant: 'default' },
    clinic_manager: { label: 'Clinic Manager', variant: 'info' },
    specialist:     { label: 'Specialist',     variant: 'success' },
    concierge:      { label: 'Concierge',      variant: 'secondary' },
  }
  const cfg = roleMap[role] ?? { label: role, variant: 'secondary' as const }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

export function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          className={`h-3.5 w-3.5 ${i < Math.floor(rating) ? 'text-gold fill-gold' : 'text-admin-border fill-admin-border'}`}
          viewBox="0 0 24 24"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span className="ml-1 text-xs text-admin-muted">{rating.toFixed(1)}</span>
    </div>
  )
}
