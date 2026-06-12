import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import type { BeforeAfter, PaginatedResponse } from '../types'

interface ListBeforeAfterQuery {
  search?: string
  treatmentId?: string
  isPublished?: boolean
  page?: number
  limit?: number
}

export function useBeforeAfters(params: ListBeforeAfterQuery) {
  return useQuery({
    queryKey: ['before-after', params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<BeforeAfter>>('/admin/before-after-cases', { params })
      return data
    },
  })
}

export function useCreateBeforeAfter() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<BeforeAfter>) => {
      const { data } = await apiClient.post<{ data: BeforeAfter }>('/admin/before-after-cases', payload)
      return data.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['before-after'] }),
  })
}

export function useUpdateBeforeAfter() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<BeforeAfter>) => {
      const { data } = await apiClient.patch<{ data: BeforeAfter }>(`/admin/before-after-cases/${id}`, payload)
      return data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['before-after'] })
      queryClient.invalidateQueries({ queryKey: ['before-after', variables.id] })
    },
  })
}

export function useDeleteBeforeAfter() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/admin/before-after-cases/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['before-after'] }),
  })
}

export function useUploadBeforeImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await apiClient.post<{ data: BeforeAfter }>(`/admin/before-after-cases/${id}/before-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['before-after'] })
      queryClient.invalidateQueries({ queryKey: ['before-after', variables.id] })
    },
  })
}

export function useUploadAfterImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await apiClient.post<{ data: BeforeAfter }>(`/admin/before-after-cases/${id}/after-image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['before-after'] })
      queryClient.invalidateQueries({ queryKey: ['before-after', variables.id] })
    },
  })
}
