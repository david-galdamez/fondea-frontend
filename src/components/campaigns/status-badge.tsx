import type { CampaignStatus } from '@/types'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: CampaignStatus
  className?: string
}

const STATUS_LABEL: Record<CampaignStatus, string> = {
  draft: 'Borrador',
  pending_review: 'En revisión',
  rejected: 'Rechazada',
  approved: 'Aprobada',
  active: 'Activa',
  successful: 'Exitosa',
  failed: 'No alcanzó la meta',
  cancelled: 'Cancelada',
}

const STATUS_CLASSES: Record<CampaignStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  pending_review: 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
  rejected: 'bg-destructive/10 text-destructive',
  approved: 'bg-blue-100 text-blue-900 dark:bg-blue-950/40 dark:text-blue-200',
  active: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200',
  successful: 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300',
  failed: 'bg-destructive/10 text-destructive',
  cancelled: 'bg-muted text-muted-foreground',
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
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
