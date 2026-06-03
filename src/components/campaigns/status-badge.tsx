import { CampaignStatus } from '@/lib/api/campaigns.service';
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: CampaignStatus
  className?: string
}

const STATUS_LABEL: Record<CampaignStatus, string> = {
  DRAFT: 'Borrador',
  UNDER_REVIEW: 'En revisión',
  ACTIVE: 'Aprobada',
  SUCCESSFUL: 'Exitosa',
  FAILED: 'No alcanzó la meta',
}

const STATUS_CLASSES: Record<CampaignStatus, string> = {
  DRAFT: 'bg-muted text-muted-foreground',
  UNDER_REVIEW: 'bg-amber-100 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200',
  ACTIVE: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200',
  SUCCESSFUL: 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300',
  FAILED: 'bg-destructive/10 text-destructive',
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
