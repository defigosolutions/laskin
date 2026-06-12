import * as React from 'react'
import { cn } from '../../lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  iconRight?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, iconRight, ...props }, ref) => {
    if (icon || iconRight) {
      return (
        <div className="relative flex items-center">
          {icon && (
            <span className="absolute left-3 text-admin-muted pointer-events-none flex items-center">
              {icon}
            </span>
          )}
          <input
            type={type}
            className={cn(
              'flex h-9 w-full rounded-lg border border-admin-border bg-admin-input px-3 py-2 text-sm text-admin-text placeholder:text-admin-muted focus:outline-none focus:ring-1 focus:ring-gold/50 focus:border-gold/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
              icon && 'pl-9',
              iconRight && 'pr-9',
              className
            )}
            ref={ref}
            {...props}
          />
          {iconRight && (
            <span className="absolute right-3 text-admin-muted pointer-events-none flex items-center">
              {iconRight}
            </span>
          )}
        </div>
      )
    }

    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-lg border border-admin-border bg-admin-input px-3 py-2 text-sm text-admin-text placeholder:text-admin-muted focus:outline-none focus:ring-1 focus:ring-gold/50 focus:border-gold/50 disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export { Input }
