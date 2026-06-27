import { categoriesService } from '@/lib/api'
import { Footer } from '@/components/layout/footer'
import { PublicNavbar } from '@/components/layout/public-navbar'

export const dynamic = 'force-dynamic'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const categories = await categoriesService.list().catch(() => [])

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PublicNavbar categories={categories} />
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
