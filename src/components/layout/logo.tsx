import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoProps {
  href?: string
  className?: string
  showWordmark?: boolean
}

export function Logo({ href = '/', className, showWordmark = true }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        'focus-visible:ring-ring inline-flex items-center gap-2 rounded-md font-semibold tracking-tight outline-none focus-visible:ring-2',
        className
      )}
      aria-label="Fondea — Inicio"
    >
      <span className="bg-primary text-primary-foreground grid size-7 place-items-center rounded-md">
        <Sparkles className="size-4" />
      </span>
      {showWordmark && <span className="text-base">Fondea</span>}
    </Link>
  )
}
