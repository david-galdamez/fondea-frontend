'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { Role } from '@/types'
import { notificationsService } from '@/lib/api'
import { getPrimaryPath, ROLE_LABEL } from '@/lib/auth-routing'
import { useSession } from '@/components/providers/session-provider'
import { AuthenticatedNavbar } from './authenticated-navbar'

interface AuthenticatedShellProps {
  requiredRole?: Role
  sidebar?: React.ReactNode
  children: React.ReactNode
}

export function AuthenticatedShell({ requiredRole, sidebar, children }: AuthenticatedShellProps) {
  const { session, isLoading, signOut } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const userId = session?.user.id
  const [unreadCount, setUnreadCount] = useState<number>(0)

  useEffect(() => {
    if (isLoading) return
    if (!session) {
      router.replace('/auth/login')
      return
    }
    if (requiredRole && !session.user.roles.includes(requiredRole)) {
      router.replace(getPrimaryPath(session.user))
    }
  }, [isLoading, session, requiredRole, router])

  useEffect(() => {
    if (!userId) return
    let cancelled = false
    notificationsService
      .countUnread(userId)
      .then((count) => {
        if (!cancelled) setUnreadCount(count)
      })
      .catch(() => {
        if (!cancelled) setUnreadCount(0)
      })
    return () => {
      cancelled = true
    }
  }, [userId, pathname])

  async function handleLogout() {
    await signOut()
    router.push('/auth/login')
  }

  if (isLoading || !session) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <p className="text-muted-foreground text-sm">Cargando…</p>
      </div>
    )
  }

  if (requiredRole && !session.user.roles.includes(requiredRole)) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16">
        <p className="text-muted-foreground text-sm">
          Necesitas el rol de {ROLE_LABEL[requiredRole]} para acceder a esta área.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AuthenticatedNavbar user={session.user} unreadCount={unreadCount} onLogout={handleLogout} />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4">
        {sidebar}
        <main className="flex-1 py-6">{children}</main>
      </div>
    </div>
  )
}
