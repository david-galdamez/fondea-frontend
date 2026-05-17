import type { PledgeStatus } from '@/types'
import { cn } from '@/lib/utils'

interface PledgeStatusBadgeProps {
  status: PledgeStatus
  className?: string
}

const STATUS_LABEL: Record<PledgeStatus, string> = {
  pending: 'Pendiente',
  authorized: 'Autorizado',
  charged: 'Cobrado',
  refunded: 'Reembolsado',
  failed: 'Falló',
  cancelled: 'Cancelado',
}

const STATUS_CLASSES: Record<PledgeStatus, string> = {
  pending: 'bg-muted text-muted-foreground',
  authorized: 'bg-blue-100 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200',
  charged: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200',
  refunded: 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
  failed: 'bg-destructive/10 text-destructive',
  cancelled: 'bg-muted text-muted-foreground line-through',
}

export function PledgeStatusBadge({ status, className }: PledgeStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        STATUS_CLASSES[status],
        className
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  )
}
