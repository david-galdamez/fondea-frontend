import { categoriesService } from '@/lib/api'
import { Footer } from '@/components/layout/footer'
import { PublicNavbar } from '@/components/layout/public-navbar'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const categories = await categoriesService.list()

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <PublicNavbar categories={categories.map((c) => ({ slug: c.slug, name: c.name }))} />
      <main id="main-content" tabIndex={-1} className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  )
}
