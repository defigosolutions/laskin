import type {
  AdminUser, AdminRole, Branch, Category,
  Booking, BookingDetail, DashboardStats,
} from '../types'
import { apiClient } from '../lib/apiClient'

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const res = await apiClient.get<{ data: DashboardStats }>('/admin/dashboard')
    return res.data.data
  },
}

// ─── Admin Users ──────────────────────────────────────────────────────────────

export interface AdminUserListMeta {
  total: number
  page: number
  limit: number
  pages: number
}

export const adminUsersService = {
  async list(params: {
    page?: number
    limit?: number
    role?: string
    isActive?: boolean
  }): Promise<{ data: AdminUser[]; meta: AdminUserListMeta }> {
    const query: Record<string, string> = {}
    if (params.page)   query.page  = String(params.page)
    if (params.limit)  query.limit = String(params.limit)
    if (params.role)   query.role  = params.role
    if (params.isActive !== undefined) query.isActive = String(params.isActive)
    const res = await apiClient.get<{ data: AdminUser[]; meta: AdminUserListMeta }>('/admin/users', { params: query })
    return res.data
  },

  async get(id: string): Promise<AdminUser> {
    const res = await apiClient.get<{ data: AdminUser }>(`/admin/users/${id}`)
    return res.data.data
  },

  async create(data: {
    email: string
    password: string
    fullName: string
    role: AdminRole
    branchId?: string | null
  }): Promise<AdminUser> {
    const res = await apiClient.post<{ data: AdminUser }>('/admin/users', data)
    return res.data.data
  },

  async update(id: string, data: {
    fullName?: string
    email?: string
    branchId?: string | null
  }): Promise<AdminUser> {
    const res = await apiClient.patch<{ data: AdminUser }>(`/admin/users/${id}`, data)
    return res.data.data
  },

  async updateRole(id: string, role: AdminRole): Promise<AdminUser> {
    const res = await apiClient.patch<{ data: AdminUser }>(`/admin/users/${id}/role`, { role })
    return res.data.data
  },

  async updateStatus(id: string, isActive: boolean): Promise<AdminUser> {
    const res = await apiClient.patch<{ data: AdminUser }>(`/admin/users/${id}/status`, { isActive })
    return res.data.data
  },

  async resetPassword(id: string, newPassword: string): Promise<void> {
    await apiClient.post(`/admin/users/${id}/reset-password`, { newPassword })
  },
}

// ─── Branches ─────────────────────────────────────────────────────────────────

export interface BranchListMeta {
  total: number
  page: number
  limit: number
  pages: number
}

export const branchesService = {
  async list(params: {
    page?: number
    limit?: number
    search?: string
    isActive?: boolean
  }): Promise<{ data: Branch[]; total: number; page: number; limit: number; totalPages: number }> {
    const query: Record<string, string> = {}
    if (params.page)   query.page  = String(params.page)
    if (params.limit)  query.limit = String(params.limit)
    if (params.search) query.search = params.search
    if (params.isActive !== undefined) query.isActive = String(params.isActive)
    
    const res = await apiClient.get<{ data: Branch[]; meta: BranchListMeta }>('/admin/branches', { params: query })
    return {
      data: res.data.data,
      total: res.data.meta.total,
      page: res.data.meta.page,
      limit: res.data.meta.limit,
      totalPages: res.data.meta.pages
    }
  },
  async get(id: string): Promise<Branch> {
    const res = await apiClient.get<{ data: Branch }>(`/admin/branches/${id}`)
    return res.data.data
  },
  async create(data: Partial<Branch>): Promise<Branch> {
    const payload = {
      slug: data.slug || data.displayName?.toLowerCase().replace(/\s+/g, '-'),
      city: data.city,
      displayName: data.displayName,
      addressLine: data.addressLine,
      phone: data.phone,
      email: data.email,
      timezone: data.timezone,
      isActive: data.isActive !== false
    }
    const res = await apiClient.post<{ data: Branch }>('/admin/branches', payload)
    return res.data.data
  },
  async update(id: string, data: Partial<Branch>): Promise<Branch> {
    const payload = {
      slug: data.slug || data.displayName?.toLowerCase().replace(/\s+/g, '-'),
      city: data.city,
      displayName: data.displayName,
      addressLine: data.addressLine,
      phone: data.phone,
      email: data.email,
      timezone: data.timezone,
      isActive: data.isActive !== false
    }
    const res = await apiClient.patch<{ data: Branch }>(`/admin/branches/${id}`, payload)
    return res.data.data
  },
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/branches/${id}`)
  },
}

// ─── Categories ───────────────────────────────────────────────────────────────

export const categoriesService = {
  async list(params: {
    page?: number
    limit?: number
    search?: string
    isActive?: boolean
  }): Promise<{ data: Category[]; total: number; page: number; limit: number; totalPages: number }> {
    const query: Record<string, string> = {}
    if (params.page)   query.page  = String(params.page)
    if (params.limit)  query.limit = String(params.limit)
    if (params.search) query.search = params.search
    if (params.isActive !== undefined) query.isActive = String(params.isActive)
    
    const res = await apiClient.get<{ data: Category[]; meta: any }>('/admin/categories', { params: query })
    return {
      data: res.data.data,
      total: res.data.meta.total,
      page: res.data.meta.page,
      limit: res.data.meta.limit,
      totalPages: res.data.meta.pages
    }
  },
  async create(data: Partial<Category>): Promise<Category> {
    const res = await apiClient.post<{ data: Category }>('/admin/categories', {
      slug: data.slug || data.displayName?.toLowerCase().replace(/\s+/g, '-'),
      displayName: data.displayName,
      displayOrder: data.displayOrder,
      isActive: data.isActive !== false
    })
    return res.data.data
  },
  async update(id: string, data: Partial<Category>): Promise<Category> {
    const res = await apiClient.patch<{ data: Category }>(`/admin/categories/${id}`, {
      slug: data.slug || data.displayName?.toLowerCase().replace(/\s+/g, '-'),
      displayName: data.displayName,
      displayOrder: data.displayOrder,
      isActive: data.isActive !== false
    })
    return res.data.data
  },
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/admin/categories/${id}`)
  },
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export type BookingAction =
  | { action: 'confirm' }
  | { action: 'cancel'; reason?: string }
  | { action: 'reschedule'; appointmentDate: string; startTime: string }
  | { action: 'complete' }
  | { action: 'no_show' }
  | { action: 'assign_specialist'; specialistId: string | null }

export interface BookingListMeta {
  total: number; page: number; limit: number; pages: number
}

export const bookingsService = {
  async list(params: {
    page?: number; limit?: number; search?: string; status?: string
    branchId?: string; specialistId?: string; date?: string
  }): Promise<{ data: Booking[]; meta: BookingListMeta }> {
    const query: Record<string, string> = {}
    if (params.page)         query.page         = String(params.page)
    if (params.limit)        query.limit        = String(params.limit)
    if (params.search)       query.search       = params.search
    if (params.status)       query.status       = params.status
    if (params.branchId)     query.branchId     = params.branchId
    if (params.specialistId) query.specialistId = params.specialistId
    if (params.date)         query.date         = params.date
    const res = await apiClient.get<{ data: Booking[]; meta: BookingListMeta }>('/admin/bookings', { params: query })
    return res.data
  },

  async get(id: string): Promise<BookingDetail> {
    const res = await apiClient.get<{ data: BookingDetail }>(`/admin/bookings/${id}`)
    return res.data.data
  },

  async action(id: string, body: BookingAction): Promise<BookingDetail> {
    const res = await apiClient.patch<{ data: BookingDetail }>(`/admin/bookings/${id}`, body)
    return res.data.data
  },
}

// ─── Branch select (for filter dropdowns) ─────────────────────────────────────

export const branchSelectService = {
  async listAll(): Promise<Array<{ id: string; displayName: string; city: string }>> {
    const res = await apiClient.get<{
      data: Array<{ id: string; displayName: string; city: string }>
    }>('/admin/branches', { params: { limit: 100 } })
    return res.data.data
  },
}
