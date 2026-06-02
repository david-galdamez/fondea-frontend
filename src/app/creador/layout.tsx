import { AuthenticatedShell } from '@/components/layout/authenticated-shell'
import { CreatorSidebar } from '@/components/layout/creator-sidebar'

export default function CreatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthenticatedShell requiredRole="CREATOR" sidebar={<CreatorSidebar />}>
      {children}
    </AuthenticatedShell>
  )
}
