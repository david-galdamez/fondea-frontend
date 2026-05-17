import { MapPin } from 'lucide-react'
import type { Location } from '@/types'
import { cn } from '@/lib/utils'

interface LocationBadgeProps {
  location: Location
  showCountry?: boolean
  className?: string
}

export function LocationBadge({ location, showCountry = true, className }: LocationBadgeProps) {
  return (
    <span className={cn('text-muted-foreground inline-flex items-center gap-1 text-xs', className)}>
      <MapPin className="size-3" aria-hidden="true" />
      <span>
        {location.city}
        {showCountry && `, ${location.country}`}
      </span>
    </span>
  )
}
