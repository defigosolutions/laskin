import axios from 'axios'
import type { Treatment, Package, Specialist, Branch, Category, BeforeAfterCase, Review, Booking } from '../admin/types'

const BASE_URL = (import.meta as ImportMeta & { env: Record<string, string> }).env?.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1'

export const publicApiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Types for responses
interface ListResponse<T> {
  data: T[]
}
interface SingleResponse<T> {
  data: T
}

export const publicApi = {
  // Treatments
  getTreatments: async (params?: { categoryId?: string; search?: string }) => {
    const { data } = await publicApiClient.get<ListResponse<Treatment>>('/treatments', { params })
    return data.data
  },
  getTreatment: async (slug: string) => {
    const { data } = await publicApiClient.get<SingleResponse<Treatment>>(`/treatments/${slug}`)
    return data.data
  },

  // Packages
  getPackages: async (params?: { search?: string }) => {
    const { data } = await publicApiClient.get<ListResponse<Package>>('/packages', { params })
    return data.data
  },
  getPackage: async (slug: string) => {
    const { data } = await publicApiClient.get<SingleResponse<Package>>(`/packages/${slug}`)
    return data.data
  },

  // Specialists
  getSpecialists: async (params?: { branchId?: string; search?: string }) => {
    const { data } = await publicApiClient.get<ListResponse<Specialist>>('/specialists', { params })
    return data.data
  },

  // Before & After
  getBeforeAfterCases: async (params?: { treatmentId?: string; search?: string }) => {
    const { data } = await publicApiClient.get<ListResponse<BeforeAfterCase>>('/before-after-cases', { params })
    return data.data
  },

  // Reviews
  getReviews: async (params?: { branchId?: string }) => {
    const { data } = await publicApiClient.get<ListResponse<Review>>('/reviews', { params })
    return data.data
  },

  // Settings
  getSiteSettings: async () => {
    const { data } = await publicApiClient.get<ListResponse<{ key: string; value: any }>>('/site-settings')
    return data.data.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {} as Record<string, any>)
  },

  // Branches
  getBranches: async () => {
    const { data } = await publicApiClient.get<ListResponse<Branch>>('/branches')
    return data.data
  },

  // Categories
  getCategories: async () => {
    const { data } = await publicApiClient.get<ListResponse<Category>>('/categories')
    return data.data
  },

  // Bookings
  getAvailability: async (params: { branchId: string; date: string }) => {
    const { data } = await publicApiClient.get<ListResponse<{
      id: string
      startTime: string
      label: string
      capacity: number
      booked: number
      available: boolean
    }>>('/bookings/availability', { params })
    return data.data
  },
  createBooking: async (payload: {
    customerFullName: string
    customerEmail: string
    customerPhone?: string
    branchId: string
    treatmentId?: string
    packageId?: string
    specialistId?: string
    appointmentDate: string
    startTime: string
    concerns?: string
    marketingConsent?: boolean
  }) => {
    const { data } = await publicApiClient.post<{ data: Booking; cancelToken: string }>('/bookings', payload)
    return data
  }
}
