'use client'

import Link from 'next/link'
import { ArrowLeft, Banknote, LayoutDashboard, Megaphone, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarNav, type SidebarNavItem } from './sidebar-nav'

const ITEMS: SidebarNavItem[] = [
  { href: '/creador', label: 'Resumen', icon: LayoutDashboard, exact: true },
  { href: '/creador/campanas', label: 'Mis campañas', icon: Megaphone },
  { href: '/creador/campanas/nueva', label: 'Nueva campaña', icon: Plus },
  { href: '/creador/retiros', label: 'Retiros', icon: Banknote },
]

export function CreatorSidebar() {
  return (
    <SidebarNav
      title="Creador"
      items={ITEMS}
      footer={
        <Button
          render={<Link href="/" />}
          variant="ghost"
          size="sm"
          className="w-full justify-start"
        >
          <ArrowLeft className="size-4" />
          Volver al sitio
        </Button>
      }
    />
  )
}
