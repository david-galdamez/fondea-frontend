import Link from 'next/link'
import { ArrowRight, HandCoins, ListChecks, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CategoryBadge } from '@/components/campaigns/category-badge'
import { FeaturedCampaigns } from '@/components/campaigns/featured-campaigns'
import { categoriesService } from '@/lib/api'

const HOW_STEPS = [
  {
    icon: Sparkles,
    title: 'Lanza tu campaña',
    body: 'Publica tu proyecto, define la meta y las recompensas para tus patrocinadores.',
  },
  {
    icon: HandCoins,
    title: 'Junta apoyos',
    body: 'Los patrocinadores prometen donaciones. Solo se cobran si alcanzas tu meta.',
  },
  {
    icon: ListChecks,
    title: 'Recibe tus fondos',
    body: 'Si la campaña es exitosa, retira los fondos menos la comisión del 5%.',
  },
] as const

export default async function HomePage() {
  const categories = await categoriesService.list()

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-16 px-4 py-10">
      <section className="flex flex-col items-start gap-5">
        <span className="bg-muted text-muted-foreground inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium">
          <Sparkles className="size-3" />
          Modelo todo o nada
        </span>
        <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Financia las ideas que quieres ver en el mundo.
        </h1>
        <p className="text-muted-foreground max-w-2xl text-lg">
          Apoya proyectos creativos, sociales y tecnológicos. Si la campaña alcanza su meta, se
          cobra tu promesa; si no, no se te cobra nada.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button render={<Link href="/explorar" />} size="lg">
            Explorar campañas
            <ArrowRight className="size-4" />
          </Button>
          <Button render={<Link href="/creador/campanas/nueva" />} variant="outline" size="lg">
            Iniciar una campaña
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <header className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Campañas destacadas</h2>
            <p className="text-muted-foreground text-sm">
              Proyectos que están cerca de su meta o tienen mucho apoyo.
            </p>
          </div>
          <Button render={<Link href="/explorar" />} variant="ghost" size="sm">
            Ver todas
            <ArrowRight className="size-4" />
          </Button>
        </header>
        <FeaturedCampaigns limit={6} />
      </section>

      {categories.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">Explora por categoría</h2>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <CategoryBadge key={cat.id} category={cat} className="text-sm" />
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-6">
        <h2 className="text-2xl font-semibold tracking-tight">Cómo funciona</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {HOW_STEPS.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="border-border bg-card flex flex-col gap-2 rounded-lg border p-5"
            >
              <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-md">
                <Icon className="size-4" />
              </span>
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="text-muted-foreground text-sm">{body}</p>
            </div>
          ))}
        </div>
        <Link
          href="/como-funciona"
          className="text-foreground inline-flex items-center gap-1 text-sm font-medium hover:underline"
        >
          Conoce los detalles
          <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  )
}
