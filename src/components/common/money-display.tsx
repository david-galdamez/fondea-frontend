import type { Money } from '@/types'
import { formatMoney } from '@/lib/money'
import { cn } from '@/lib/utils'

interface MoneyDisplayProps {
  value: Money
  className?: string
  locale?: string
}

export function MoneyDisplay({ value, className, locale }: MoneyDisplayProps) {
  return (
    <span className={cn('tabular-nums', className)} aria-label={formatMoney(value, locale)}>
      {formatMoney(value, locale)}
    </span>
  )
}
