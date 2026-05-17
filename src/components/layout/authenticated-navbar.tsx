'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'
import type { User } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Logo } from './logo'
import { NotificationBell } from './notification-bell'
import { ThemeToggle } from './theme-toggle'
import { UserMenu } from './user-menu'

interface AuthenticatedNavbarProps {
  user: User
  unreadCount?: number
  onLogout?: () => void
}

export function AuthenticatedNavbar({ user, unreadCount, onLogout }: AuthenticatedNavbarProps) {
  const router = useRouter()

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    const data = new FormData(form)
    const query = String(data.get('query') ?? '').trim()
    router.push(query ? `/explorar?query=${encodeURIComponent(query)}` : '/explorar')
  }

  return (
    <header className="border-border bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
        <Logo />

        <form
          onSubmit={handleSearch}
          className="relative ml-2 hidden max-w-md flex-1 md:block"
          role="search"
        >
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
          <Input
            type="search"
            name="query"
            placeholder="Buscar campañas…"
            className="h-8 pl-8"
            aria-label="Buscar campañas"
          />
        </form>

        <div className="ml-auto flex items-center gap-1.5">
          <Button
            render={<Link href="/explorar" />}
            variant="ghost"
            size="icon-sm"
            aria-label="Explorar"
            className="md:hidden"
          >
            <Search className="size-4" />
          </Button>
          <NotificationBell unreadCount={unreadCount} />
          <ThemeToggle />
          <UserMenu user={user} onLogout={onLogout} />
        </div>
      </div>
    </header>
  )
}
