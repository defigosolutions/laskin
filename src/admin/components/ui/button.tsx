import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 disabled:pointer-events-none disabled:opacity-40 cursor-pointer',
  {
    variants: {
      variant: {
        default:     'bg-gold text-admin-bg hover:bg-gold-light shadow-gold-glow hover:shadow-none',
        secondary:   'bg-admin-card text-admin-text border border-admin-border hover:bg-admin-hover hover:border-admin-border2',
        outline:     'border border-admin-border bg-transparent text-admin-text hover:bg-admin-card hover:border-admin-border2',
        ghost:       'bg-transparent text-admin-muted hover:bg-admin-card hover:text-admin-text',
        destructive: 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40',
        link:        'text-gold underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        sm:      'h-8 px-3 text-xs gap-1.5',
        default: 'h-9 px-4',
        lg:      'h-11 px-6 text-base',
        icon:    'h-9 w-9 p-0',
        'icon-sm': 'h-7 w-7 p-0 text-xs',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
