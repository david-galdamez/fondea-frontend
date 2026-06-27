import { MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LocationBadgeProps {
  city: string
  country: string
  showCountry?: boolean
  className?: string
}

export function LocationBadge({
  city,
  country,
  showCountry = true,
  className,
}: LocationBadgeProps) {
  return (
    <span className={cn('text-muted-foreground inline-flex items-center gap-1 text-xs', className)}>
      <MapPin className="size-3" aria-hidden="true" />
      <span>
        {city}
        {showCountry && `, ${country}`}
      </span>
    </span>
  )
}
