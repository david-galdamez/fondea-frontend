import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { AuthenticatedShell } from '@/components/layout/authenticated-shell'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthenticatedShell requiredRole="ADMIN" sidebar={<AdminSidebar />}>
      {children}
    </AuthenticatedShell>
  )
}
