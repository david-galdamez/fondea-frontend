'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, HelpCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Logo } from './logo'
import { ThemeToggle } from './theme-toggle'
import { Category } from '@/lib/api/categories.service'

interface PublicNavbarProps {
  categories?: Category[]
}

const NAV_ITEMS = [
  { href: '/explorar', label: 'Explorar', icon: Compass },
  { href: '/como-funciona', label: 'Cómo funciona', icon: HelpCircle },
] as const

export function PublicNavbar({ categories = [] }: PublicNavbarProps) {
  const pathname = usePathname()

  return (
    <header className="border-border bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href)
            return (
              <Button
                key={href}
                render={<Link href={href} aria-current={active ? 'page' : undefined} />}
                variant="ghost"
                size="sm"
                className={cn(active && 'bg-muted text-foreground')}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Button>
            )
          })}

          {categories.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant="ghost" size="sm">
                    Categorías
                  </Button>
                }
              />
              <DropdownMenuContent align="start">
                {categories.map((cat) => (
                  <DropdownMenuItem key={cat.id} render={<Link href={`/categorias/${cat.id}`} />}>
                    {cat.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            render={<Link href="/creador/campanas/nueva" />}
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Sparkles className="size-4" aria-hidden="true" />
            Iniciar campaña
          </Button>
          <ThemeToggle />
          <Button render={<Link href="/auth/login" />} variant="ghost" size="sm">
            Iniciar sesión
          </Button>
          <Button render={<Link href="/auth/registro" />} size="sm">
            Registrarse
          </Button>
        </div>
      </div>
    </header>
  )
}
