import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import type { Specialist, PaginatedResponse } from '../types'

interface ListSpecialistsQuery {
  search?: string
  branchId?: string
  isPublished?: boolean
  includeDeleted?: boolean
  page?: number
  limit?: number
}

export function useSpecialists(params: ListSpecialistsQuery) {
  return useQuery({
    queryKey: ['specialists', params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Specialist>>('/admin/specialists', { params })
      return data
    },
  })
}

export function useCreateSpecialist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<Specialist>) => {
      const { data } = await apiClient.post<{ data: Specialist }>('/admin/specialists', payload)
      return data.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['specialists'] }),
  })
}

export function useUpdateSpecialist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<Specialist>) => {
      const { data } = await apiClient.patch<{ data: Specialist }>(`/admin/specialists/${id}`, payload)
      return data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['specialists'] })
      queryClient.invalidateQueries({ queryKey: ['specialists', variables.id] })
    },
  })
}

export function useDeleteSpecialist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/admin/specialists/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['specialists'] }),
  })
}

export function useRestoreSpecialist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => apiClient.post(`/admin/specialists/${id}/restore`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['specialists'] }),
  })
}

export function useUploadSpecialistPortrait() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await apiClient.post<{ data: Specialist }>(`/admin/specialists/${id}/portrait`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['specialists'] })
      queryClient.invalidateQueries({ queryKey: ['specialists', variables.id] })
    },
  })
}
