import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import type { SiteSetting } from '../types'

export function useSettings() {
  return useQuery({
    queryKey: ['site-settings'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: SiteSetting[] }>('/admin/site-settings')
      return data.data
    },
  })
}

export function useUpdateSetting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { data } = await apiClient.put<{ data: SiteSetting }>(`/admin/site-settings/${key}`, { value })
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] })
    },
  })
}

export function useDeleteSetting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (key: string) => apiClient.delete(`/admin/site-settings/${key}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] })
    },
  })
}
