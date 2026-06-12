import React from 'react'
import { SearchX, Inbox } from 'lucide-react'
import { cn } from '../lib/utils'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  filtered?: boolean
  className?: string
}

export default function EmptyState({ title, description, icon, action, filtered, className }: EmptyStateProps) {
  const Icon = filtered ? SearchX : Inbox

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-admin-card border border-admin-border text-admin-subtle">
        {icon ?? <Icon className="h-6 w-6" />}
      </div>
      <p className="text-sm font-medium font-sans text-admin-text mb-1">{title}</p>
      {description && (
        <p className="text-xs text-admin-muted max-w-xs">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
