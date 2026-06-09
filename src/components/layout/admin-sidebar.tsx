'use client'

import { useEffect, useState } from 'react'
import { Flag, LayoutDashboard, ListChecks, Megaphone, Users } from 'lucide-react'
import { adminService } from '@/lib/api'
import { SidebarNav, type SidebarNavItem } from './sidebar-nav'

interface AdminBadges {
  pendingReview?: number
  openFraud?: number
}

export function AdminSidebar() {
  const [badges, setBadges] = useState<AdminBadges>({})

  useEffect(() => {
    let cancelled = false
    Promise.all([adminService.getPendingCampaigns(), adminService.getPendingFraudReports()]).then(
      ([pending, fraudOpen]) => {
        if (cancelled) return
        setBadges({
          pendingReview: pending.length,
          openFraud: fraudOpen.length,
        })
      }
    )
    return () => {
      cancelled = true
    }
  }, [])

  const items: SidebarNavItem[] = [
    { href: '/admin', label: 'Resumen', icon: LayoutDashboard, exact: true },
    {
      href: '/admin/validacion',
      label: 'Cola de validación',
      icon: ListChecks,
      badge: badges.pendingReview,
    },
    { href: '/admin/campanas', label: 'Campañas', icon: Megaphone },
    {
      href: '/admin/fraude',
      label: 'Reportes de fraude',
      icon: Flag,
      badge: badges.openFraud,
    },
    { href: '/admin/usuarios', label: 'Usuarios', icon: Users },
  ]

  return <SidebarNav title="Administración" items={items} />
}
