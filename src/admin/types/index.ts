// ─── Shared ──────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export type SortOrder = 'asc' | 'desc'

export interface TableParams {
  page: number
  limit: number
  search?: string
  sortBy?: string
  sortOrder?: SortOrder
  filters?: Record<string, string | string[]>
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type AdminRole = 'super_admin' | 'clinic_manager' | 'specialist' | 'concierge'

export interface AdminUser {
  id: string
  email: string
  fullName: string
  role: AdminRole
  branchId: string | null
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
}

// ─── Branches ─────────────────────────────────────────────────────────────────

export interface Branch {
  id: string
  slug: string
  city: string
  displayName: string
  addressLine: string
  phone: string
  email: string
  timezone: string
  mapX: string | null
  mapY: string | null
  displayOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

// ─── Categories ───────────────────────────────────────────────────────────────

export interface Category {
  id: string
  slug: string
  displayName: string
  displayOrder: number
  isActive: boolean
}

// ─── Treatments ───────────────────────────────────────────────────────────────

export interface TreatmentStep {
  id: string
  stepOrder: number
  description: string
}

export interface Treatment {
  id: string
  slug: string
  name: string
  tagline: string | null
  categoryId: string
  durationMinutes: number
  recoveryText: string | null
  priceCents: number
  currency: string
  imageUrl: string | null
  iconKey: string | null
  shortDescription: string
  scientificText: string | null
  displayOrder: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  category?: { id: string; name: string }
  steps?: TreatmentStep[]
}

// ─── Specialists ──────────────────────────────────────────────────────────────

export interface Specialist {
  id: string
  slug: string
  fullName: string
  role: string
  credential: string | null
  focus: string | null
  philosophy: string | null
  portraitUrl: string | null
  userId: string | null
  displayOrder: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  branches?: { branch: { id: string; displayName: string } }[]
}

// ─── Packages ─────────────────────────────────────────────────────────────────

export interface PackageTreatment {
  treatmentId: string
  position: number
  treatment?: { id: string; name: string }
}

export interface PackageInclusion {
  position: number
  description: string
}

export interface Package {
  id: string
  slug: string
  name: string
  tagline: string | null
  priceCents: number
  valuePriceCents: number | null
  currency: string
  badge: string | null
  displayOrder: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  inclusions?: PackageInclusion[]
  treatments?: PackageTreatment[]
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export type BookingStatus = 'pending' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled' | 'no_show'

export interface Booking {
  id: string
  reference: string
  status: BookingStatus
  appointmentDate: string       // "YYYY-MM-DD"
  startTime: string | null      // "HH:MM"
  durationMinutes: number
  concerns: string | null
  source: string | null
  cancelledReason: string | null
  cancelledAt: string | null
  confirmedAt: string | null
  createdAt: string
  updatedAt: string
  customer: { id: string; fullName: string; email: string; phone: string | null }
  branch: { id: string; slug: string; city: string; displayName: string }
  treatment: { id: string; slug: string; name: string } | null
  package: { id: string; slug: string; name: string } | null
  specialist: { id: string; slug: string; fullName: string } | null
}

export interface BookingAuditEntry {
  id: string
  action: string
  fromState: unknown
  toState: unknown
  note: string | null
  createdAt: string
  actorUser: { id: string; fullName: string; role: string } | null
}

export interface BookingDetail extends Booking {
  auditEntries: BookingAuditEntry[]
}

// ─── Before & After ───────────────────────────────────────────────────────────

export interface BeforeAfter {
  id: string
  slug: string
  title: string
  subtitle: string | null
  treatmentId: string | null
  timelineText: string | null
  primaryIndications: string | null
  therapistNotes: string | null
  satisfactionText: string | null
  ageProfile: string | null
  beforeImageUrl: string
  afterImageUrl: string
  displayOrder: number
  isPublished: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  treatment?: { id: string; name: string } | null
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export interface Review {
  id: string
  customerId: string | null
  branchId: string | null
  authorName: string
  quote: string
  rating: number // 1-5
  status: 'pending' | 'approved' | 'rejected'
  isFeatured: boolean
  displayOrder: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  branch?: { id: string; displayName: string } | null
}

// ─── Uploads ──────────────────────────────────────────────────────────────────

export type UploadFolder = 'treatments' | 'specialists' | 'before-after' | 'reviews' | 'branches' | 'general'

export interface Upload {
  id: string
  publicUrl: string
  filename: string
  originalName: string
  mimeType: string
  sizeBytes: number
  folder: UploadFolder
  uploadedBy: string | null
  createdAt: string
}

// ─── Site Settings ────────────────────────────────────────────────────────────

export interface SiteSetting {
  key: string
  value: any
  description: string | null
  isPublic: boolean
  updatedAt: string
  updatedBy: string | null
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export interface AuditLog {
  id: string
  userId: string | null
  userEmail: string | null
  userRole: string | null
  entityType: string
  entityId: string | null
  action: string
  oldData: Record<string, any> | null
  newData: Record<string, any> | null
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardBooking {
  id: string
  reference: string
  status: string
  appointmentDate: string
  startTime: string | null
  durationMinutes: number
  source: string | null
  createdAt: string
  customer: { id: string; fullName: string; email: string; phone: string | null }
  branch: { id: string; slug: string; city: string; displayName: string }
  treatment: { id: string; slug: string; name: string } | null
  package: { id: string; slug: string; name: string } | null
  specialist: { id: string; slug: string; fullName: string } | null
}

export interface DashboardAuditLog {
  id: string
  userId: string | null
  userEmail: string | null
  userRole: string | null
  entityType: string
  entityId: string | null
  action: string
  ipAddress: string | null
  createdAt: string
}

export interface DashboardStats {
  stats: {
    totalBookings: number
    todayBookings: number
    pendingBookings: number
    confirmedBookings: number
    completedBookings: number
    totalSpecialists: number
    totalTreatments: number
    totalReviews: number
    bookingsByStatus: Record<string, number>
  }
  recentBookings: DashboardBooking[]
  recentAuditLogs: DashboardAuditLog[]
}
