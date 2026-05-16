import { AuthenticatedShell } from '@/components/layout/authenticated-shell'

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <AuthenticatedShell activeRole="backer">{children}</AuthenticatedShell>
}
