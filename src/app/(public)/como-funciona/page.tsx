import Link from 'next/link'
import type { Metadata } from 'next'
import {
  ArrowRight,
  CheckCircle2,
  Coins,
  HandCoins,
  HelpCircle,
  LifeBuoy,
  ListChecks,
  ScrollText,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Cómo funciona',
  description:
    'Modelo todo-o-nada, comisión del 5% y garantías para creadores y patrocinadores en Fondea.',
}

const STEPS = [
  {
    icon: Sparkles,
    title: '1. Crea tu campaña',
    body: 'Define una meta clara, una fecha límite y recompensas opcionales. La revisión inicial toma menos de 48 horas.',
  },
  {
    icon: HandCoins,
    title: '2. Recibe promesas',
    body: 'Comparte tu campaña. Los patrocinadores prometen un monto, no se cobran de inmediato.',
  },
  {
    icon: TrendingUp,
    title: '3. Alcanza la meta',
    body: 'Si llegas a tu objetivo antes de la fecha límite, se cobran las promesas y los fondos quedan disponibles.',
  },
  {
    icon: ListChecks,
    title: '4. Retira y entrega',
    body: 'Solicita el retiro (menos la comisión del 5%) y cumple con tus recompensas y actualizaciones.',
  },
] as const

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: 'Todo o nada',
    body: 'Si la campaña no alcanza su meta, ningún patrocinador es cobrado. Sin riesgo de quedarse con fondos insuficientes.',
  },
  {
    icon: Coins,
    title: 'Comisión transparente',
    body: 'Fondea cobra un 5% sobre el total recaudado, sólo si la campaña tiene éxito. Cero costos de publicación.',
  },
  {
    icon: Users,
    title: 'Validación por equipo',
    body: 'Todas las campañas pasan por revisión humana antes de publicarse, para proteger a la comunidad.',
  },
  {
    icon: LifeBuoy,
    title: 'Reporte de fraude',
    body: 'Si algo no luce bien, cualquier persona puede reportar una campaña y nuestro equipo la revisa rápidamente.',
  },
] as const

const FAQS = [
  {
    q: '¿Cuándo se cobra a los patrocinadores?',
    a: 'Sólo cuando la campaña alcanza el 100% de su meta antes de la fecha límite. Si la meta no se cumple, no hay cobro.',
  },
  {
    q: '¿Qué pasa si la campaña no llega a la meta?',
    a: 'Las promesas se cancelan automáticamente y nadie es cobrado. El creador puede ajustar la campaña y volver a lanzarla.',
  },
  {
    q: '¿Cómo se calcula la comisión?',
    a: 'Es un 5% sobre el total recaudado, descontado al momento del retiro. Si recaudas USD 10,000, recibes USD 9,500.',
  },
  {
    q: '¿Cuánto tarda un retiro?',
    a: 'Los creadores nuevos tienen un límite diario mientras se completa la verificación. Después de eso, los retiros son inmediatos.',
  },
  {
    q: '¿Puedo apoyar de forma anónima?',
    a: 'Sí. Al momento de hacer la promesa puedes marcarla como anónima para que tu nombre no aparezca en la lista pública.',
  },
  {
    q: '¿Recibo un comprobante para deducción fiscal?',
    a: 'Las campañas elegibles emiten certificados de donación que puedes descargar desde tu panel cuando se completa el cobro.',
  },
] as const

export default function ComoFuncionaPage() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-16 px-4 py-12">
      <section className="flex flex-col items-center gap-4 text-center">
        <span className="bg-muted text-muted-foreground inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
          <ScrollText className="size-3.5" aria-hidden="true" />
          Cómo funciona Fondea
        </span>
        <h1 className="font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
          Financia ideas que importan, sin riesgo para nadie
        </h1>
        <p className="text-muted-foreground max-w-2xl text-base">
          Fondea opera bajo un modelo todo-o-nada: las campañas sólo cobran si alcanzan su meta.
          Así, los creadores reúnen el presupuesto que necesitan y los patrocinadores no asumen
          riesgos innecesarios.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <Button render={<Link href="/creador/campanas/nueva" />} size="sm">
            <Sparkles className="size-4" aria-hidden="true" />
            Iniciar una campaña
          </Button>
          <Button render={<Link href="/explorar" />} variant="outline" size="sm">
            Explorar campañas
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">Cuatro pasos para llegar lejos</h2>
          <p className="text-muted-foreground text-sm">
            El recorrido típico de una campaña, desde la idea hasta los fondos en mano.
          </p>
        </header>
        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="border-border bg-card flex flex-col gap-2 rounded-lg border p-5"
            >
              <div
                aria-hidden="true"
                className="bg-muted ring-border/60 flex size-10 items-center justify-center rounded-full ring-1"
              >
                <Icon className="text-foreground size-5" />
              </div>
              <h3 className="text-sm font-semibold">{title}</h3>
              <p className="text-muted-foreground text-sm">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">Garantías para ambas partes</h2>
          <p className="text-muted-foreground text-sm">
            Reglas claras para que creadores y patrocinadores sepan exactamente qué esperar.
          </p>
        </header>
        <div className="grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map(({ icon: Icon, title, body }) => (
            <article key={title} className="border-border bg-card flex gap-3 rounded-lg border p-5">
              <div
                aria-hidden="true"
                className="bg-muted ring-border/60 flex size-10 shrink-0 items-center justify-center rounded-full ring-1"
              >
                <Icon className="text-foreground size-5" />
              </div>
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="text-muted-foreground text-sm">{body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">Ejemplo de cobro</h2>
          <p className="text-muted-foreground text-sm">
            Imagina que tu meta es USD 10,000 y la alcanzas. Así se ve el desglose.
          </p>
        </header>
        <div className="border-border bg-card overflow-hidden rounded-lg border">
          <dl className="divide-border divide-y text-sm">
            <div className="flex items-center justify-between gap-4 px-5 py-3">
              <dt className="text-muted-foreground">Total recaudado</dt>
              <dd className="font-medium">USD 10,000.00</dd>
            </div>
            <div className="flex items-center justify-between gap-4 px-5 py-3">
              <dt className="text-muted-foreground">Comisión Fondea (5%)</dt>
              <dd className="text-muted-foreground font-medium">− USD 500.00</dd>
            </div>
            <div className="bg-muted/40 flex items-center justify-between gap-4 px-5 py-3">
              <dt className="font-semibold">Neto a retirar</dt>
              <dd className="text-base font-semibold">USD 9,500.00</dd>
            </div>
          </dl>
        </div>
        <ul className="text-muted-foreground flex flex-col gap-1 text-sm">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="text-foreground mt-0.5 size-4 shrink-0" aria-hidden="true" />
            La comisión sólo aplica si la campaña es exitosa.
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="text-foreground mt-0.5 size-4 shrink-0" aria-hidden="true" />
            No hay costos por publicar o mantener una campaña activa.
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="text-foreground mt-0.5 size-4 shrink-0" aria-hidden="true" />
            Las recompensas físicas las gestiona el creador directamente.
          </li>
        </ul>
      </section>

      <section className="flex flex-col gap-6">
        <header className="flex flex-col gap-1">
          <h2 className="text-2xl font-semibold tracking-tight">Preguntas frecuentes</h2>
          <p className="text-muted-foreground text-sm">
            Si tienes una duda que no esté aquí, escríbenos y la incluimos.
          </p>
        </header>
        <div className="flex flex-col gap-3">
          {FAQS.map(({ q, a }) => (
            <details
              key={q}
              className="border-border bg-card group rounded-lg border px-5 py-4 open:pb-5"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-3 text-sm font-medium select-none">
                <span className="flex items-start gap-2">
                  <HelpCircle
                    className="text-muted-foreground mt-0.5 size-4 shrink-0"
                    aria-hidden="true"
                  />
                  {q}
                </span>
                <ArrowRight
                  className="text-muted-foreground size-4 rotate-90 transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="text-muted-foreground mt-3 text-sm">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="border-border bg-muted/30 flex flex-col items-center gap-3 rounded-xl border px-6 py-10 text-center">
        <h2 className="text-xl font-semibold tracking-tight">¿Listo para empezar?</h2>
        <p className="text-muted-foreground max-w-xl text-sm">
          Publica tu campaña en menos de 10 minutos o apoya a un creador que admires.
        </p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
          <Button render={<Link href="/creador/campanas/nueva" />} size="sm">
            Iniciar una campaña
          </Button>
          <Button render={<Link href="/explorar" />} variant="outline" size="sm">
            Ver campañas activas
          </Button>
        </div>
      </section>
    </div>
  )
}
