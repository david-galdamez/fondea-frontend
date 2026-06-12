import type { PledgeStatus } from '@/lib/api/pledges.service'
import { cn } from '@/lib/utils'

interface PledgeStatusBadgeProps {
  status: PledgeStatus
  className?: string
}

const STATUS_LABEL: Record<PledgeStatus, string> = {
  PENDING: 'Pendiente',
  AUTHORIZED: 'Autorizado',
  CAPTURED: 'Cobrado',
  REFUNDED: 'Reembolsado',
  CANCELLED: 'Cancelado',
}

const STATUS_CLASSES: Record<PledgeStatus, string> = {
  PENDING: 'bg-muted text-muted-foreground',
  AUTHORIZED: 'bg-blue-100 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200',
  CAPTURED: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200',
  REFUNDED: 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
  CANCELLED: 'bg-muted text-muted-foreground line-through',
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
