import React, { useState } from 'react'
import { Search, Filter, Download } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import DataTable, { type Column } from '../components/DataTable'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Badge } from '../components/ui/badge'
import type { AuditLog } from '../types'
import { formatDateTime } from '../lib/utils'
import { useAuditLogs } from '../hooks/useAuditLogs'

const actionColorMap: Record<string, 'success' | 'error' | 'warning' | 'info' | 'purple' | 'secondary'> = {
  created: 'success',
  updated: 'info',
  deleted: 'error',
  published: 'success',
  archived: 'secondary',
  login: 'info',
  logout: 'secondary',
  approved: 'success',
  rejected: 'error',
  exported: 'purple',
}

const ACTIONS = ['created', 'updated', 'deleted', 'published', 'archived', 'login', 'logout', 'approved', 'rejected', 'exported']
const ROLES = ['super_admin', 'clinic_manager', 'specialist', 'concierge']

export default function AuditLogs() {
  const [params, setParams] = useState({ page: 1, limit: 50 })
  const [search, setSearch] = useState('') // Used as userEmail filter
  const [actionFilter, setActionFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data: auditRes, isLoading } = useAuditLogs({
    ...params,
    userEmail: search || undefined,
    action: actionFilter === 'all' ? undefined : actionFilter,
    userRole: roleFilter === 'all' ? undefined : roleFilter,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  })

  const columns: Column<AuditLog>[] = [
    {
      key: 'createdAt',
      label: 'Time',
      render: (r) => <span className="text-xs text-admin-muted whitespace-nowrap">{formatDateTime(r.createdAt)}</span>,
    },
    {
      key: 'userEmail',
      label: 'User',
      render: (r) => (
        <div>
          <p className="text-sm font-medium text-admin-text">{r.userEmail || 'System'}</p>
          <p className="text-xs text-admin-subtle capitalize">{r.userRole?.replace('_', ' ')}</p>
        </div>
      ),
    },
    {
      key: 'action',
      label: 'Action',
      render: (r) => <Badge variant={actionColorMap[r.action] ?? 'secondary'} className="capitalize">{r.action}</Badge>,
    },
    {
      key: 'entityType',
      label: 'Resource',
      render: (r) => (
        <div>
          <p className="text-sm text-admin-text">{r.entityType}</p>
          {r.entityId && <p className="text-xs text-admin-muted truncate max-w-[180px]">ID: {r.entityId}</p>}
        </div>
      ),
    },
    {
      key: 'changes',
      label: 'Changes',
      render: (r) => {
        if (!r.oldData && !r.newData) return <span className="text-xs text-admin-subtle">—</span>
        const oldVals = r.oldData || {}
        const newVals = r.newData || {}
        
        // Find keys that changed
        const allKeys = Array.from(new Set([...Object.keys(oldVals), ...Object.keys(newVals)]))
        const changes = allKeys.filter(k => JSON.stringify(oldVals[k]) !== JSON.stringify(newVals[k]))
        
        if (changes.length === 0) {
          if (Object.keys(newVals).length > 0) return <span className="text-xs text-green-400">Payload recorded</span>
          return <span className="text-xs text-admin-subtle">—</span>
        }

        return (
          <div className="space-y-0.5 max-h-24 overflow-y-auto">
            {changes.map((key) => {
              const fromStr = JSON.stringify(oldVals[key])
              const toStr = JSON.stringify(newVals[key])
              return (
                <div key={key} className="text-[10px]">
                  <span className="text-admin-muted">{key}: </span>
                  {oldVals[key] !== undefined && <span className="text-red-400 line-through truncate max-w-[80px] inline-block align-bottom">{fromStr}</span>}
                  {oldVals[key] !== undefined && newVals[key] !== undefined && <span className="text-admin-subtle mx-1">→</span>}
                  {newVals[key] !== undefined && <span className="text-green-400 truncate max-w-[80px] inline-block align-bottom">{toStr}</span>}
                </div>
              )
            })}
          </div>
        )
      },
    },
    {
      key: 'ipAddress',
      label: 'IP',
      render: (r) => <span className="font-mono text-[10px] text-admin-subtle">{r.ipAddress}</span>,
    },
  ]

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Audit Logs"
        description="Track all administrative actions across the system"
      />

      <div className="flex flex-wrap gap-3">
        <Input placeholder="Search by email..." icon={<Search className="h-3.5 w-3.5" />} value={search} onChange={(e) => { setSearch(e.target.value); setParams((p) => ({ ...p, page: 1 })) }} className="max-w-xs" />
        
        <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setParams((p) => ({ ...p, page: 1 })) }}>
          <SelectTrigger className="w-36"><Filter className="h-3.5 w-3.5 text-admin-muted mr-1" /><SelectValue placeholder="Action" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {ACTIONS.map((a) => <SelectItem key={a} value={a} className="capitalize">{a}</SelectItem>)}
          </SelectContent>
        </Select>

        <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setParams((p) => ({ ...p, page: 1 })) }}>
          <SelectTrigger className="w-40"><Filter className="h-3.5 w-3.5 text-admin-muted mr-1" /><SelectValue placeholder="Role" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r.replace('_', ' ')}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Input type="date" className="w-36 text-xs" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setParams(p => ({...p, page: 1}))}} />
          <span className="text-admin-muted">to</span>
          <Input type="date" className="w-36 text-xs" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setParams(p => ({...p, page: 1}))}} />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={auditRes?.data || []}
        loading={isLoading} total={auditRes?.total || 0} page={params.page} limit={params.limit}
        onPageChange={(p) => setParams((prev) => ({ ...prev, page: p }))}
        onLimitChange={(l) => setParams((prev) => ({ ...prev, limit: l, page: 1 }))}
        emptyTitle="No audit logs found" isFiltered={!!(search || actionFilter !== 'all' || roleFilter !== 'all' || dateFrom || dateTo)}
        rowKey={(r) => r.id}
      />
    </div>
  )
}
