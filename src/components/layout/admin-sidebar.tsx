'use client'

import { Flag, LayoutDashboard, ListChecks, Megaphone, Users } from 'lucide-react'
import { SidebarNav, type SidebarNavItem } from './sidebar-nav'

interface AdminSidebarProps {
  pendingReviewCount?: number
  openFraudReportsCount?: number
}

export function AdminSidebar({ pendingReviewCount, openFraudReportsCount }: AdminSidebarProps) {
  const items: SidebarNavItem[] = [
    { href: '/admin', label: 'Resumen', icon: LayoutDashboard, exact: true },
    {
      href: '/admin/validacion',
      label: 'Cola de validación',
      icon: ListChecks,
      badge: pendingReviewCount,
    },
    { href: '/admin/campanas', label: 'Campañas', icon: Megaphone },
    {
      href: '/admin/fraude',
      label: 'Reportes de fraude',
      icon: Flag,
      badge: openFraudReportsCount,
    },
    { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  ]

  return <SidebarNav title="Administración" items={items} />
}
