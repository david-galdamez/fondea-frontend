import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { AuthenticatedShell } from '@/components/layout/authenticated-shell'
import { adminService, fraudService } from '@/lib/api'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [pending, fraudOpen] = await Promise.all([
    adminService.listPendingReview(1, 1),
    fraudService.listAll('open', 1, 1),
  ])

  return (
    <AuthenticatedShell
      activeRole="admin"
      sidebar={
        <AdminSidebar pendingReviewCount={pending.total} openFraudReportsCount={fraudOpen.total} />
      }
    >
      {children}
    </AuthenticatedShell>
  )
}
