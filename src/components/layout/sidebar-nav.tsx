'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SidebarNavItem {
  href: string
  label: string
  icon: LucideIcon
  badge?: number | string
  exact?: boolean
}

interface SidebarNavProps {
  title?: string
  items: SidebarNavItem[]
  footer?: React.ReactNode
}

function isActive(pathname: string, href: string, exact: boolean | undefined): boolean {
  if (exact) return pathname === href
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function SidebarNav({ title, items, footer }: SidebarNavProps) {
  const pathname = usePathname()

  return (
    <aside
      aria-label={title ?? 'Navegación de sección'}
      className="border-border bg-background hidden w-60 shrink-0 border-r md:flex md:flex-col"
    >
      <div className="flex-1 overflow-y-auto p-3">
        {title && (
          <h2 className="text-muted-foreground mb-2 px-2 text-xs font-medium tracking-wide uppercase">
            {title}
          </h2>
        )}
        <nav className="flex flex-col gap-0.5" aria-label={title}>
          {items.map(({ href, label, icon: Icon, badge, exact }) => {
            const active = isActive(pathname, href, exact)
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
                  active
                    ? 'bg-muted text-foreground font-medium'
                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span className="flex-1 truncate">{label}</span>
                {badge !== undefined && badge !== 0 && (
                  <span
                    aria-label={`${badge} pendientes`}
                    className="bg-primary text-primary-foreground inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] leading-none font-medium"
                  >
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
      {footer && <div className="border-border border-t p-3">{footer}</div>}
    </aside>
  )
}
