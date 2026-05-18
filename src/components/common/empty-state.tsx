import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border-border bg-muted/30 flex flex-col items-center gap-3 rounded-lg border border-dashed px-6 py-12 text-center',
        className
      )}
    >
      {Icon && (
        <div
          aria-hidden="true"
          className="from-muted to-muted/40 ring-border/60 flex size-16 items-center justify-center rounded-full bg-gradient-to-br ring-1"
        >
          <Icon className="text-muted-foreground size-7" />
        </div>
      )}
      <h3 className="text-base font-medium">{title}</h3>
      {description && <p className="text-muted-foreground max-w-md text-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
