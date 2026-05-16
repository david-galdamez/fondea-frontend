'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import type { Role } from '@/types'
import { userForRole } from '@/lib/mock-session'
import { AuthenticatedNavbar } from './authenticated-navbar'

interface AuthenticatedShellProps {
  activeRole: Role
  sidebar?: React.ReactNode
  unreadCount?: number
  children: React.ReactNode
}

export function AuthenticatedShell({
  activeRole: initialRole,
  sidebar,
  unreadCount,
  children,
}: AuthenticatedShellProps) {
  const [activeRole, setActiveRole] = useState<Role>(initialRole)
  const router = useRouter()
  const user = userForRole(activeRole)

  function handleSwitchRole(role: Role) {
    setActiveRole(role)
    if (role === 'admin') router.push('/admin')
    else if (role === 'creator') router.push('/creador')
    else router.push('/dashboard')
  }

  function handleLogout() {
    router.push('/auth/login')
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <AuthenticatedNavbar
        user={user}
        activeRole={activeRole}
        unreadCount={unreadCount}
        onSwitchRole={handleSwitchRole}
        onLogout={handleLogout}
      />
      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4">
        {sidebar}
        <main className="flex-1 py-6">{children}</main>
      </div>
    </div>
  )
}
