import { useQuery, useMutation } from '@tanstack/react-query'
import { publicApi } from '../lib/api'

export function usePublicTreatments(params?: { categoryId?: string; search?: string }) {
  return useQuery({
    queryKey: ['public', 'treatments', params],
    queryFn: () => publicApi.getTreatments(params),
  })
}

export function usePublicPackages(params?: { search?: string }) {
  return useQuery({
    queryKey: ['public', 'packages', params],
    queryFn: () => publicApi.getPackages(params),
  })
}

export function usePublicProducts() {
  return useQuery({
    queryKey: ['public', 'products'],
    queryFn: () => publicApi.getProducts(),
  })
}

export function usePublicSpecialists(params?: { branchId?: string; search?: string }) {
  return useQuery({
    queryKey: ['public', 'specialists', params],
    queryFn: () => publicApi.getSpecialists(params),
  })
}

export function usePublicBeforeAfterCases(params?: { treatmentId?: string; search?: string }) {
  return useQuery({
    queryKey: ['public', 'before-after-cases', params],
    queryFn: () => publicApi.getBeforeAfterCases(params),
  })
}

export function usePublicReviews(params?: { branchId?: string }) {
  return useQuery({
    queryKey: ['public', 'reviews', params],
    queryFn: () => publicApi.getReviews(params),
  })
}

export function usePublicSiteSettings() {
  return useQuery({
    queryKey: ['public', 'site-settings'],
    queryFn: () => publicApi.getSiteSettings(),
    staleTime: 5 * 60 * 1000,
  })
}

export function usePublicBranches() {
  return useQuery({
    queryKey: ['public', 'branches'],
    queryFn: () => publicApi.getBranches(),
    staleTime: 5 * 60 * 1000,
  })
}

export function usePublicCategories() {
  return useQuery({
    queryKey: ['public', 'categories'],
    queryFn: () => publicApi.getCategories(),
    staleTime: 5 * 60 * 1000,
  })
}

export function useAvailability(params: { branchId: string; date: string }) {
  return useQuery({
    queryKey: ['public', 'availability', params],
    queryFn: () => publicApi.getAvailability(params),
    enabled: !!params.branchId && !!params.date,
  })
}

export function useCreateBooking() {
  return useMutation({
    mutationFn: publicApi.createBooking,
  })
}
