import { useQuery } from '@tanstack/react-query'
import { apiClient } from '../lib/apiClient'
import type { AuditLog, PaginatedResponse } from '../types'

interface ListAuditLogsQuery {
  userId?: string
  userEmail?: string
  userRole?: string
  entityType?: string
  action?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
}

export function useAuditLogs(params: ListAuditLogsQuery) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResponse<AuditLog>>('/admin/audit-logs', { params })
      return data
    },
  })
}
