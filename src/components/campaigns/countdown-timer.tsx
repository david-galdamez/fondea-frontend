import { CalendarClock } from 'lucide-react'
import type { ISODateString } from '@/types'
import type { CampaignStatus } from '@/lib/api/campaigns.service'
import { cn } from '@/lib/utils'

interface CountdownTimerProps {
  endDate: ISODateString
  status: CampaignStatus
  className?: string
  iconClassName?: string
}

function diffDays(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

function diffHours(from: Date, to: Date): number {
  const ms = to.getTime() - from.getTime()
  return Math.ceil(ms / (1000 * 60 * 60))
}

function formatRemaining(endDate: ISODateString): string {
  const end = new Date(endDate)
  const now = new Date()
  const days = diffDays(now, end)
  if (days >= 2) return `${days} días restantes`
  if (days === 1) return '1 día restante'
  const hours = diffHours(now, end)
  if (hours > 1) return `${hours} horas restantes`
  if (hours === 1) return '1 hora restante'
  return 'Cierra pronto'
}

const TERMINAL_LABEL: Partial<Record<CampaignStatus, string>> = {
  SUCCESSFUL: 'Campaña exitosa',
  FAILED: 'No alcanzó la meta',
}

export function CountdownTimer({ endDate, status, className, iconClassName }: CountdownTimerProps) {
  const terminal = TERMINAL_LABEL[status]
  const label = terminal ?? (status === 'ACTIVE' ? formatRemaining(endDate) : 'Pendiente de inicio')

  return (
    <span className={cn('text-muted-foreground inline-flex items-center gap-1 text-xs', className)}>
      <CalendarClock className={cn('size-3', iconClassName)} aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}
