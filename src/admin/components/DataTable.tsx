import React from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { Button } from './ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import EmptyState from './EmptyState'
import LoadingState from './LoadingState'
import { cn } from '../lib/utils'

export interface Column<T> {
  key: string
  label: string
  render?: (row: T) => React.ReactNode
  className?: string
  headerClassName?: string
  sortable?: boolean
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  total?: number
  page?: number
  limit?: number
  onPageChange?: (page: number) => void
  onLimitChange?: (limit: number) => void
  emptyTitle?: string
  emptyDescription?: string
  emptyAction?: React.ReactNode
  isFiltered?: boolean
  className?: string
  rowKey?: (row: T) => string
}

export default function DataTable<T extends object>({
  columns, data, loading, total = 0, page = 1, limit = 10,
  onPageChange, onLimitChange,
  emptyTitle = 'No results found', emptyDescription, emptyAction, isFiltered,
  className, rowKey,
}: DataTableProps<T>) {
  const totalPages = Math.ceil(total / limit)
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  if (loading) return <LoadingState rows={limit} className={className} />

  return (
    <div className={cn('rounded-2xl border border-admin-border bg-admin-card/80 backdrop-blur-md shadow-card overflow-hidden transition-all duration-500', className)}>
      {data.length === 0 ? (
        <EmptyState
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
          filtered={isFiltered}
        />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b-admin-border">
                {columns.map((col) => (
                  <TableHead key={col.key} className={col.headerClassName}>
                    {col.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, i) => (
                <TableRow key={rowKey ? rowKey(row) : i}>
                  {columns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          {total > 0 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-admin-border bg-admin-surface/50">
              <div className="flex items-center gap-3">
                <p className="text-xs text-admin-muted">
                  {from}–{to} of {total} results
                </p>
                {onLimitChange && (
                  <Select value={String(limit)} onValueChange={(v) => onLimitChange(Number(v))}>
                    <SelectTrigger className="h-7 w-16 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[10, 20, 50].map((n) => (
                        <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon-sm" disabled={page <= 1} onClick={() => onPageChange?.(1)}>
                  <ChevronsLeft className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon-sm" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)}>
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="text-xs text-admin-muted px-2">
                  {page} / {totalPages || 1}
                </span>
                <Button variant="ghost" size="icon-sm" disabled={page >= totalPages} onClick={() => onPageChange?.(page + 1)}>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon-sm" disabled={page >= totalPages} onClick={() => onPageChange?.(totalPages)}>
                  <ChevronsRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
