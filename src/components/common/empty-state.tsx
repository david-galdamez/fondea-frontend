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
        'border-border bg-muted/30 flex flex-col items-center gap-2 rounded-lg border border-dashed px-6 py-12 text-center',
        className
      )}
    >
      {Icon && <Icon className="text-muted-foreground size-8" aria-hidden="true" />}
      <h3 className="text-base font-medium">{title}</h3>
      {description && <p className="text-muted-foreground max-w-md text-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
