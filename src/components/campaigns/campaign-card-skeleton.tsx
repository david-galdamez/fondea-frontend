import { cn } from '@/lib/utils'

interface CampaignCardSkeletonProps {
  className?: string
}

export function CampaignCardSkeleton({ className }: CampaignCardSkeletonProps) {
  return (
    <div
      className={cn(
        'border-border bg-card flex animate-pulse flex-col overflow-hidden rounded-lg border',
        className
      )}
      aria-hidden="true"
    >
      <div className="bg-muted aspect-[16/9] w-full" />
      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-2">
          <div className="bg-muted h-4 w-3/4 rounded" />
          <div className="bg-muted h-3 w-full rounded" />
          <div className="bg-muted h-3 w-2/3 rounded" />
        </div>
        <div className="bg-muted h-1.5 w-full rounded-full" />
        <div className="flex items-center justify-between">
          <div className="bg-muted h-3 w-20 rounded" />
          <div className="bg-muted h-3 w-16 rounded" />
        </div>
      </div>
    </div>
  )
}
