import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Campaign, Pledge } from '@/types'
import { formatShortDate } from '@/lib/dates'
import { cn } from '@/lib/utils'
import { MoneyDisplay } from '@/components/common/money-display'
import { PledgeStatusBadge } from './pledge-status-badge'

interface PledgeListItemProps {
  pledge: Pledge
  campaign?: Pick<Campaign, 'slug' | 'title'> | null
  href?: string
  className?: string
}

export function PledgeListItem({ pledge, campaign, href, className }: PledgeListItemProps) {
  const detailHref = href ?? `/dashboard/pledges/${pledge.id}`
  return (
    <Link
      href={detailHref}
      className={cn(
        'group border-border bg-card hover:border-foreground/20 flex items-center gap-4 rounded-lg border p-4 transition-colors',
        className
      )}
    >
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <p className="truncate text-sm font-medium">{campaign?.title ?? 'Campaña eliminada'}</p>
        <p className="text-muted-foreground text-xs">
          {formatShortDate(pledge.createdAt)}
          {pledge.isAnonymous && ' · Anónimo'}
        </p>
      </div>
      <div className="flex flex-col items-end gap-1">
        <MoneyDisplay value={pledge.amount} className="text-sm font-medium" />
        <PledgeStatusBadge status={pledge.status} />
      </div>
      <ChevronRight className="text-muted-foreground size-4 shrink-0" aria-hidden="true" />
    </Link>
  )
}
