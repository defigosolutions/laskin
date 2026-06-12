import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardContent } from './ui/card'
import { cn } from '../lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: { value: number; label?: string }
  description?: string
  accent?: boolean
  className?: string
}

export default function StatCard({ title, value, icon, trend, description, accent, className }: StatCardProps) {
  const trendUp = trend && trend.value > 0
  const trendDown = trend && trend.value < 0
  const trendFlat = trend && trend.value === 0

  return (
    <Card className={cn('relative overflow-hidden', accent && 'border-gold/30', className)}>
      {accent && (
        <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent pointer-events-none" />
      )}
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold text-admin-subtle uppercase tracking-[0.15em] truncate">{title}</p>
            <p className={cn('mt-1.5 font-sans font-semibold text-2xl tracking-tight truncate', accent ? 'text-gold' : 'text-admin-text')}>
              {value}
            </p>
            {(trend || description) && (
              <div className="mt-2 flex items-center gap-1.5">
                {trend && (
                  <>
                    {trendUp   && <TrendingUp  className="h-3.5 w-3.5 text-green-400" />}
                    {trendDown && <TrendingDown className="h-3.5 w-3.5 text-red-400" />}
                    {trendFlat && <Minus        className="h-3.5 w-3.5 text-admin-muted" />}
                    <span className={cn(
                      'text-xs font-medium',
                      trendUp   && 'text-green-400',
                      trendDown && 'text-red-400',
                      trendFlat && 'text-admin-muted',
                    )}>
                      {trend.value > 0 ? '+' : ''}{trend.value}%
                    </span>
                    {trend.label && <span className="text-xs text-admin-subtle">{trend.label}</span>}
                  </>
                )}
                {description && !trend && (
                  <span className="text-xs text-admin-muted">{description}</span>
                )}
              </div>
            )}
          </div>
          <div className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            accent ? 'bg-gold/15 text-gold' : 'bg-admin-hover text-admin-muted'
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
