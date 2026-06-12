import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import type { Review, PaginatedResponse } from '../types'

interface ListReviewsAdminQuery {
  branchId?: string
  status?: string
  isFeatured?: boolean
  search?: string
  page?: number
  limit?: number
}

export function useReviews(params: ListReviewsAdminQuery) {
  return useQuery({
    queryKey: ['reviews', params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Review>>('/admin/reviews', { params })
      return data
    },
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<Review>) => {
      const { data } = await apiClient.post<{ data: Review }>('/admin/reviews', payload)
      return data.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  })
}

export function useUpdateReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<Review>) => {
      const { data } = await apiClient.patch<{ data: Review }>(`/admin/reviews/${id}`, payload)
      return data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.id] })
    },
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/admin/reviews/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reviews'] }),
  })
}
