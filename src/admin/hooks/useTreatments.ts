import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import type { Treatment, PaginatedResponse } from '../types'

interface ListTreatmentsQuery {
  search?: string
  categoryId?: string
  isPublished?: boolean
  includeDeleted?: boolean
  page?: number
  limit?: number
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useTreatments(params: ListTreatmentsQuery) {
  return useQuery({
    queryKey: ['treatments', params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Treatment>>('/admin/treatments', { params })
      return data
    },
  })
}

export function useTreatment(id: string) {
  return useQuery({
    queryKey: ['treatments', id],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Treatment }>(`/admin/treatments/${id}`)
      return data.data
    },
    enabled: !!id,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateTreatment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<Treatment>) => {
      const { data } = await apiClient.post<{ data: Treatment }>('/admin/treatments', payload)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatments'] })
    },
  })
}

export function useUpdateTreatment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<Treatment>) => {
      const { data } = await apiClient.patch<{ data: Treatment }>(`/admin/treatments/${id}`, payload)
      return data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['treatments'] })
      queryClient.invalidateQueries({ queryKey: ['treatments', variables.id] })
    },
  })
}

export function useDeleteTreatment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/admin/treatments/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatments'] })
    },
  })
}

export function useRestoreTreatment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/admin/treatments/${id}/restore`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatments'] })
    },
  })
}

export function useUploadTreatmentImage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, file }: { id: string; file: File }) => {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await apiClient.post<{ data: Treatment }>(`/admin/treatments/${id}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      return data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['treatments'] })
      queryClient.invalidateQueries({ queryKey: ['treatments', variables.id] })
    },
  })
}
