'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Check, LayoutDashboard, LogOut, Megaphone, ShieldCheck, UserCog } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Role, User } from '@/types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ROLE_HOME, ROLE_LABEL } from '@/lib/auth-routing'
import { UserAvatar } from './user-avatar'

interface UserMenuProps {
  user: User
  onLogout?: () => void
}

const ROLE_ICON: Record<Role, LucideIcon> = {
  ADMIN: ShieldCheck,
  CREATOR: Megaphone,
  SPONSOR: LayoutDashboard,
}

const ROLE_ORDER: Role[] = ['ADMIN', 'CREATOR', 'SPONSOR']

function activeRoleFromPath(pathname: string): Role | null {
  if (pathname.startsWith('/admin')) return 'ADMIN'
  if (pathname.startsWith('/creador')) return 'CREATOR'
  if (pathname.startsWith('/dashboard')) return 'SPONSOR'
  return null
}

export function UserMenu({ user, onLogout }: UserMenuProps) {
  const pathname = usePathname()
  const activeRole = activeRoleFromPath(pathname)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="sm" aria-label="Menú de usuario" className="px-1.5">
            <UserAvatar user={user} size="sm" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-60">
        <div className="flex items-center gap-2 px-1.5 py-1.5">
          {/* <UserAvatar user={user} size="md" /> */}
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{user.name}</span>
            <span className="text-muted-foreground truncate text-xs">{user.email}</span>
          </div>
        </div>
        <DropdownMenuSeparator />

        {ROLE_ORDER.length > 0 && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel>Mis paneles</DropdownMenuLabel>
              {ROLE_ORDER.filter(r => r == user.role).map((role) => {
                const Icon = ROLE_ICON[role]
                const isActive = activeRole === role
                return (
                  <DropdownMenuItem key={role} render={<Link href={ROLE_HOME[role]} />}>
                    <Icon className="size-4" />
                    <span className="flex-1">Panel de {ROLE_LABEL[role].toLowerCase()}</span>
                    {isActive && <Check className="text-muted-foreground size-3.5" />}
                  </DropdownMenuItem>
                )
              })}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem render={<Link href="/perfil" />}>
          <UserCog className="size-4" />
          Editar perfil
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onLogout}>
          <LogOut className="size-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
