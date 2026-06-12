import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import type { Package, PaginatedResponse } from '../types'

interface ListPackagesQuery {
  search?: string
  isPublished?: boolean
  includeDeleted?: boolean
  page?: number
  limit?: number
}

export function usePackages(params: ListPackagesQuery) {
  return useQuery({
    queryKey: ['packages', params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<Package>>('/admin/packages', { params })
      return data
    },
  })
}

export function useCreatePackage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: Partial<Package>) => {
      const { data } = await apiClient.post<{ data: Package }>('/admin/packages', payload)
      return data.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packages'] }),
  })
}

export function useUpdatePackage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & Partial<Package>) => {
      const { data } = await apiClient.patch<{ data: Package }>(`/admin/packages/${id}`, payload)
      return data.data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['packages'] })
      queryClient.invalidateQueries({ queryKey: ['packages', variables.id] })
    },
  })
}

export function useDeletePackage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/admin/packages/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packages'] }),
  })
}

export function useRestorePackage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => apiClient.post(`/admin/packages/${id}/restore`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['packages'] }),
  })
}
