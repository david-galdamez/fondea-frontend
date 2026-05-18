import Link from 'next/link'
import type { Metadata } from 'next'
import { ScrollText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Términos y condiciones',
  description:
    'Términos de uso de Fondea: aceptación, elegibilidad, campañas, promesas, retiros y resolución de disputas.',
}

const LAST_UPDATED = '17 de mayo de 2026'

const SECTIONS = [
  {
    id: 'aceptacion',
    title: '1. Aceptación de los términos',
    body: [
      'Al crear una cuenta o utilizar Fondea (la "Plataforma"), aceptas estos Términos y Condiciones en su totalidad. Si no estás de acuerdo con alguno, no debes utilizar el servicio.',
      'Fondea puede actualizar estos términos en cualquier momento. Los cambios entran en vigor al publicarse en esta página, y el uso continuado de la plataforma implica aceptación de los términos actualizados.',
    ],
  },
  {
    id: 'elegibilidad',
    title: '2. Elegibilidad',
    body: [
      'Debes ser mayor de edad en tu país de residencia para abrir una cuenta. Una persona o entidad sólo puede mantener una cuenta activa salvo autorización expresa de Fondea.',
      'Te comprometes a proveer información veraz al registrarte y a mantenerla actualizada.',
    ],
  },
  {
    id: 'campanas',
    title: '3. Campañas y creadores',
    body: [
      'Los creadores son los únicos responsables de la veracidad de la información publicada en sus campañas, del cumplimiento de las recompensas ofrecidas y del uso legítimo de los fondos recaudados.',
      'Toda campaña pasa por una revisión inicial antes de publicarse. Fondea puede rechazar o suspender campañas que infrinjan la ley, los derechos de terceros o estos términos.',
      'Las campañas operan bajo modelo todo-o-nada: si la meta no se alcanza dentro del plazo, no se cobra a los patrocinadores y los fondos no se transfieren al creador.',
    ],
  },
  {
    id: 'promesas',
    title: '4. Promesas (pledges)',
    body: [
      'Una promesa es una autorización de cobro condicionada al éxito de la campaña. El monto autorizado sólo se cobra si la campaña alcanza el 100% de su meta antes de la fecha límite.',
      'Mientras la campaña esté activa, los patrocinadores pueden cancelar su promesa. Una vez cobrada, los reembolsos se rigen por la política específica del creador y la legislación aplicable.',
    ],
  },
  {
    id: 'comision',
    title: '5. Comisión y retiros',
    body: [
      'Fondea cobra una comisión del 5% sobre el total recaudado al momento del retiro, únicamente cuando una campaña es exitosa. No existen costos de publicación ni de mantenimiento.',
      'Los creadores nuevos pueden estar sujetos a un límite diario de retiro mientras se completa la verificación de identidad. Una vez verificada la cuenta, los retiros se procesan según los plazos publicados.',
    ],
  },
  {
    id: 'conducta',
    title: '6. Conducta prohibida',
    body: [
      'No se permite publicar contenido ilegal, fraudulento, difamatorio, discriminatorio o que infrinja derechos de propiedad intelectual.',
      'Está prohibido manipular el sistema de promesas (auto-promesas masivas, lavado de fondos, suplantación de identidad).',
      'Cualquier usuario puede reportar una campaña sospechosa desde su detalle o vía /campanas/[slug]/reportar.',
    ],
  },
  {
    id: 'responsabilidad',
    title: '7. Limitación de responsabilidad',
    body: [
      'Fondea actúa como intermediario tecnológico entre creadores y patrocinadores. No es responsable de la entrega de recompensas, del uso de los fondos ni de disputas entre las partes.',
      'En la medida que la ley lo permita, la responsabilidad máxima de Fondea frente a cualquier reclamo se limita al monto de comisiones efectivamente cobradas al usuario en los últimos 12 meses.',
    ],
  },
  {
    id: 'cuenta',
    title: '8. Suspensión y cierre de cuenta',
    body: [
      'Fondea puede suspender o cerrar cuentas que infrinjan estos términos, sin previo aviso si la infracción es grave.',
      'El usuario puede cerrar su cuenta en cualquier momento. Las obligaciones derivadas de campañas activas o promesas autorizadas sobreviven al cierre.',
    ],
  },
  {
    id: 'ley',
    title: '9. Ley aplicable',
    body: [
      'Estos términos se rigen por las leyes del país de operación de Fondea. Cualquier disputa se someterá a los tribunales competentes de dicha jurisdicción, salvo que la ley aplicable disponga otra cosa.',
    ],
  },
] as const

export default function TerminosPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-12">
      <header className="flex flex-col gap-3">
        <span className="bg-muted text-muted-foreground inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
          <ScrollText className="size-3.5" aria-hidden="true" />
          Documento legal
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Términos y condiciones
        </h1>
        <p className="text-muted-foreground text-sm">Última actualización: {LAST_UPDATED}</p>
        <p className="text-muted-foreground text-sm">
          Este documento describe las reglas que rigen el uso de Fondea como plataforma de
          financiamiento colectivo. Al utilizarla, aceptas estos términos.
        </p>
      </header>

      <nav aria-label="Índice" className="border-border bg-muted/30 rounded-lg border p-4">
        <h2 className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
          Contenido
        </h2>
        <ol className="grid gap-1 text-sm sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <li key={s.id}>
              <Link href={`#${s.id}`} className="text-muted-foreground hover:text-foreground">
                {s.title}
              </Link>
            </li>
          ))}
        </ol>
      </nav>

      <div className="flex flex-col gap-8">
        {SECTIONS.map((section) => (
          <section key={section.id} id={section.id} className="flex scroll-mt-20 flex-col gap-3">
            <h2 className="text-xl font-semibold tracking-tight">{section.title}</h2>
            {section.body.map((p, i) => (
              <p key={i} className="text-muted-foreground text-sm leading-relaxed">
                {p}
              </p>
            ))}
          </section>
        ))}
      </div>

      <footer className="border-border text-muted-foreground border-t pt-6 text-xs">
        ¿Tienes dudas sobre estos términos?{' '}
        <Link href="/privacidad" className="hover:text-foreground underline underline-offset-2">
          Lee también nuestra política de privacidad
        </Link>
        .
      </footer>
    </div>
  )
}
