import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import type { Upload, UploadFolder, PaginatedResponse } from '../types'

interface ListUploadsQuery {
  folder?: UploadFolder | 'all'
  page?: number
  limit?: number
}

export function useUploads(params: ListUploadsQuery) {
  return useQuery({
    queryKey: ['uploads', params],
    queryFn: async () => {
      const queryParams = { ...params }
      if (queryParams.folder === 'all') delete queryParams.folder
      const { data } = await apiClient.get<PaginatedResponse<Upload>>('/admin/uploads', { params: queryParams })
      return data
    },
  })
}

export function useCreateUpload() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ folder, file }: { folder: UploadFolder; file: File }) => {
      const formData = new FormData()
      formData.append('file', file)
      const { data } = await apiClient.post<{ data: Upload }>(`/admin/uploads/${folder}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data.data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['uploads'] }),
  })
}

export function useDeleteUpload() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => apiClient.delete(`/admin/uploads/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['uploads'] }),
  })
}
