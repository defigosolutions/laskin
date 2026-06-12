import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:     'border-gold/30 bg-gold/10 text-gold',
        secondary:   'border-admin-border bg-admin-card text-admin-muted',
        success:     'border-green-500/30 bg-green-500/10 text-green-400',
        warning:     'border-amber-500/30 bg-amber-500/10 text-amber-400',
        error:       'border-red-500/30 bg-red-500/10 text-red-400',
        info:        'border-blue-500/30 bg-blue-500/10 text-blue-400',
        purple:      'border-purple-500/30 bg-purple-500/10 text-purple-400',
        outline:     'border-admin-border bg-transparent text-admin-text',
      },
    },
    defaultVariants: { variant: 'default' },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
