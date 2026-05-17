import { Users } from 'lucide-react'
import type { Money } from '@/types'
import { progressRatio } from '@/lib/money'
import { cn } from '@/lib/utils'
import { MoneyDisplay } from '@/components/common/money-display'

interface CampaignProgressProps {
  raised: Money
  goal: Money
  backersCount?: number
  size?: 'sm' | 'md'
  className?: string
}

export function CampaignProgress({
  raised,
  goal,
  backersCount,
  size = 'md',
  className,
}: CampaignProgressProps) {
  const ratio = progressRatio(raised, goal)
  const percent = Math.min(100, Math.round(ratio * 100))
  const reached = ratio >= 1

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div
        className="bg-muted relative h-1.5 w-full overflow-hidden rounded-full"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width]',
            reached ? 'bg-emerald-500' : 'bg-primary'
          )}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div
        className={cn(
          'text-muted-foreground flex items-center justify-between gap-2',
          size === 'sm' ? 'text-xs' : 'text-sm'
        )}
      >
        <span>
          <MoneyDisplay value={raised} className="text-foreground font-medium" />
          <span className="ml-1">de</span> <MoneyDisplay value={goal} />
        </span>
        <span className="flex items-center gap-2">
          <span className={cn(reached && 'text-emerald-600 dark:text-emerald-400', 'font-medium')}>
            {percent}%
          </span>
          {backersCount !== undefined && (
            <span className="inline-flex items-center gap-1">
              <Users className="size-3" aria-hidden="true" />
              {backersCount}
            </span>
          )}
        </span>
      </div>
    </div>
  )
}
