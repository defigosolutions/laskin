import React from 'react'
import { cn } from '../lib/utils'

interface LoadingStateProps {
  rows?: number
  className?: string
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-4 py-3 border-b border-admin-border last:border-0">
      <div className="h-8 w-8 rounded-full bg-admin-hover animate-pulse shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/3 rounded bg-admin-hover animate-pulse" />
        <div className="h-2.5 w-1/2 rounded bg-admin-hover animate-pulse" />
      </div>
      <div className="h-6 w-16 rounded-full bg-admin-hover animate-pulse" />
      <div className="h-7 w-7 rounded-lg bg-admin-hover animate-pulse" />
    </div>
  )
}

export default function LoadingState({ rows = 5, className }: LoadingStateProps) {
  return (
    <div className={cn('rounded-xl border border-admin-border bg-admin-card overflow-hidden', className)}>
      {/* Header skeleton */}
      <div className="flex items-center gap-4 px-4 py-2.5 border-b border-admin-border bg-admin-surface">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-3 rounded bg-admin-hover animate-pulse" style={{ width: `${[80, 120, 60, 80][i]}px` }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} />
      ))}
    </div>
  )
}

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center justify-center py-12', className)}>
      <div className="h-7 w-7 rounded-full border-2 border-admin-border border-t-gold animate-spin" />
    </div>
  )
}

export function LoadingCards({ count = 4, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-xl border border-admin-border bg-admin-card p-5 space-y-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="h-3 w-24 rounded bg-admin-hover animate-pulse" />
              <div className="h-6 w-16 rounded bg-admin-hover animate-pulse" />
            </div>
            <div className="h-10 w-10 rounded-xl bg-admin-hover animate-pulse" />
          </div>
          <div className="h-2.5 w-20 rounded bg-admin-hover animate-pulse" />
        </div>
      ))}
    </div>
  )
}
