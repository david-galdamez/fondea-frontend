import { cn } from '@/lib/utils'
import { MoneyDisplay } from '@/components/common/money-display'
import { RewardSummaryDto } from '@/lib/api/rewards.service'
import { money } from '@/lib/money'

interface RewardCardProps {
  reward: RewardSummaryDto
  className?: string
}

function formatDeliveryDate(iso?: string): string | null {
  if (!iso) return null
  const date = new Date(iso)
  return new Intl.DateTimeFormat('es', { month: 'long', year: 'numeric' }).format(date)
}

export function RewardCard({ reward, className }: RewardCardProps) {
  const remaining = reward.stock !== undefined ? Math.max(0, reward.stock) : null
  const soldOut = remaining === 0
  const delivery = formatDeliveryDate(reward.estimatedDelivery)

  return (
    <div
      className={cn(
        'border-border bg-card flex flex-col gap-3 rounded-lg border p-4',
        soldOut && 'opacity-60',
        className
      )}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold">{reward.title}</h3>
        <span className="text-foreground text-sm font-medium">
          desde <MoneyDisplay value={money(Math.round(reward.minAmount * 100))} />
        </span>
      </div>
      <p className="text-muted-foreground text-sm whitespace-pre-wrap">{reward.description}</p>
      <dl className="text-muted-foreground grid grid-cols-1 gap-1 text-xs sm:grid-cols-3">
        {delivery && (
          <div className="flex flex-col">
            <dt className="font-medium">Entrega estimada</dt>
            <dd className="capitalize">{delivery}</dd>
          </div>
        )}
        {remaining !== null && (
          <div className="flex flex-col">
            <dt className="font-medium">Disponibilidad</dt>
            <dd>{soldOut ? 'Agotada' : `${remaining} disponibles de ${reward.stock}`}</dd>
          </div>
        )}
      </dl>
    </div>
  )
}
