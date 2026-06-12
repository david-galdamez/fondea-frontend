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
  const [unreadKey, setUnreadKey] = useState(0)

  useEffect(() => {
    if (isLoading) return
    if (!session) {
      router.replace('/auth/login')
      return
    }
    if (requiredRole && session.user.role === requiredRole) {
      router.replace(getPrimaryPath(session.user))
    }
  }, [isLoading, session, requiredRole, router])

  useEffect(() => {
    let cancelled = false
    notificationsService
      .countUnread()
      .then((count) => {
        if (!cancelled) setUnreadCount(count)
      })
      .catch(() => {
        if (!cancelled) setUnreadCount(0)
      })
    return () => {
      cancelled = true
    }
  }, [pathname, unreadKey])

  useEffect(() => {
    if (isLoading) return
    if (!session) {
      router.replace('/auth/login')
      return
    }
    if (!session.user.isVerified) {
      router.replace('/auth/confirmar')
      return
    }
    if (requiredRole && session.user.role !== requiredRole) {
      router.replace(getPrimaryPath(session.user))
    }
  }, [isLoading, session, requiredRole, router])

  async function handleLogout() {
    await signOut()
    router.push('/auth/login')
  }

  if (isLoading || !session) {
    return (
      <div
        className="flex flex-1 items-center justify-center px-4 py-16"
        role="status"
        aria-live="polite"
      >
        <span className="sr-only">Cargando tu sesión…</span>
        <span
          aria-hidden="true"
          className="border-muted-foreground/30 border-t-foreground size-6 animate-spin rounded-full border-2"
        />
      </div>
    )
  }

  if (requiredRole && session.user.role !== requiredRole) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-16" role="alert">
        <p className="text-muted-foreground text-sm">
          Necesitas el rol de {ROLE_LABEL[requiredRole]} para acceder a esta área.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AuthenticatedNavbar
        user={session.user}
        unreadCount={unreadCount}
        onUnreadChange={() => setUnreadKey((k) => k + 1)}
        onLogout={handleLogout}
      />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4">
        {sidebar}
        <main id="main-content" tabIndex={-1} className="flex-1 py-6">
          {children}
        </main>
      </div>
    </div>
  )
}
