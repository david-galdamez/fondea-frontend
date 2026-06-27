import Link from 'next/link'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CampaignProgress } from './campaign-progress'
import { CountdownTimer } from './countdown-timer'
import { LocationBadge } from './location-badge'
import { StatusBadge } from './status-badge'
import { CampaignSummaryDto } from '@/lib/api/campaigns.service'
import { money } from '@/lib/money'

interface CampaignCardProps {
  campaign: CampaignSummaryDto
  className?: string
}

export function CampaignCard({ campaign, className }: CampaignCardProps) {
  const isActive = campaign.status === 'ACTIVE'

  return (
    <Link
      href={`/campanas/${campaign.id}`}
      className={cn(
        'group border-border bg-card hover:border-foreground/20 focus-visible:ring-ring relative flex flex-col overflow-hidden rounded-lg border transition-colors focus-visible:ring-2 focus-visible:outline-none',
        className
      )}
    >
      <div className="bg-muted relative aspect-[16/9] w-full overflow-hidden">
        {campaign.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={campaign.coverImageUrl}
            alt=""
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="text-muted-foreground flex h-full w-full items-center justify-center text-xs">
            Sin imagen
          </div>
        )}
        {campaign.featured && (
          <span className="bg-background/90 text-foreground absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium backdrop-blur">
            <Star className="size-3 fill-current" aria-hidden="true" />
            Destacada
          </span>
        )}
        {!isActive && (
          <span className="absolute top-2 right-2">
            <StatusBadge status={campaign.status} />
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <h3 className="line-clamp-2 text-base font-semibold tracking-tight">{campaign.title}</h3>
          {/* <p className="text-muted-foreground line-clamp-2 text-sm">{campaign.description}</p> */}
        </div>

        <CampaignProgress
          raised={money(Math.round(campaign.totalPledged * 100))}
          goal={money(Math.round(campaign.goalAmount * 100))}
          backersCount={campaign.pledgeCount}
          size="sm"
        />

        <div className="mt-auto flex items-center justify-between gap-2">
          <LocationBadge city={campaign.locationCity} country={campaign.locationCountry} />
          <CountdownTimer endDate={campaign.deadline} status={campaign.status} />
        </div>
      </div>
    </Link>
  )
}
