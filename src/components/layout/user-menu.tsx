'use client'

import Link from 'next/link'
import { LayoutDashboard, LogOut, ShieldCheck, Megaphone, UserCog } from 'lucide-react'
import type { Role, User } from '@/types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserAvatar } from './user-avatar'

interface UserMenuProps {
  user: User
  activeRole: Role
  onSwitchRole?: (role: Role) => void
  onLogout?: () => void
}

const ROLE_LABEL: Record<Role, string> = {
  admin: 'Administrador',
  creator: 'Creador',
  backer: 'Patrocinador',
}

const ROLE_HOME: Record<Role, string> = {
  admin: '/admin',
  creator: '/creador',
  backer: '/dashboard',
}

export function UserMenu({ user, activeRole, onSwitchRole, onLogout }: UserMenuProps) {
  const canSwitch = user.roles.length > 1

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="sm" aria-label="Menú de usuario" className="px-1.5">
            <UserAvatar user={user} size="sm" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-56">
        <div className="flex items-center gap-2 px-1.5 py-1.5">
          <UserAvatar user={user} size="md" />
          <div className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{user.name}</span>
            <span className="text-muted-foreground truncate text-xs">{user.email}</span>
          </div>
        </div>
        <DropdownMenuSeparator />

        {canSwitch && (
          <>
            <DropdownMenuLabel>Rol activo</DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={activeRole}
              onValueChange={(value) => onSwitchRole?.(value as Role)}
            >
              {user.roles.map((role) => (
                <DropdownMenuRadioItem key={role} value={role}>
                  {role === 'admin' && <ShieldCheck className="size-4" />}
                  {role === 'creator' && <Megaphone className="size-4" />}
                  {role === 'backer' && <LayoutDashboard className="size-4" />}
                  {ROLE_LABEL[role]}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href={ROLE_HOME[activeRole]} />}>
            <LayoutDashboard className="size-4" />
            Ir a mi panel
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/perfil" />}>
            <UserCog className="size-4" />
            Editar perfil
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={onLogout}>
          <LogOut className="size-4" />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
