import Link from 'next/link'
import type { Metadata } from 'next'
import { ShieldCheck } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description:
    'Política de privacidad de Fondea: qué datos recolectamos, cómo los usamos, con quién los compartimos y tus derechos.',
}

const LAST_UPDATED = '17 de mayo de 2026'

const SECTIONS = [
  {
    id: 'datos',
    title: '1. Qué datos recolectamos',
    body: [
      'Información de la cuenta: nombre, correo electrónico, ubicación, biografía y rol (creador, patrocinador o ambos).',
      'Información de campañas y promesas: contenido publicado, montos prometidos, recompensas seleccionadas y comunicaciones asociadas.',
      'Datos técnicos: dirección IP, tipo de dispositivo y navegador, y eventos de uso necesarios para operar el servicio y prevenir abuso.',
    ],
  },
  {
    id: 'uso',
    title: '2. Cómo usamos tu información',
    body: [
      'Para operar la plataforma: procesar registros, mantener tu sesión, mostrar tus campañas y promesas, y enviar notificaciones relevantes.',
      'Para cumplir obligaciones legales: emisión de comprobantes, certificados de donación cuando apliquen y respuesta a requerimientos de autoridades competentes.',
      'Para mejorar el servicio: análisis agregado y anónimo del comportamiento de uso. No vendemos tus datos a terceros.',
    ],
  },
  {
    id: 'compartir',
    title: '3. Con quién compartimos tu información',
    body: [
      'Con los creadores que apoyas: nombre público (o "Anónimo" si así lo eliges) y el monto de tu promesa, una vez confirmada.',
      'Con proveedores de servicios que nos asisten en hosting, comunicaciones, prevención de fraude y procesamiento de pagos, bajo acuerdos de confidencialidad.',
      'Con autoridades cuando exista una obligación legal de hacerlo, y exclusivamente sobre la información requerida.',
    ],
  },
  {
    id: 'cookies',
    title: '4. Cookies y tecnologías similares',
    body: [
      'Usamos cookies esenciales para mantener tu sesión iniciada y recordar preferencias como el tema claro/oscuro. No utilizamos cookies de publicidad de terceros.',
      'Puedes administrar las cookies desde la configuración de tu navegador. Deshabilitar las cookies esenciales puede impedir el uso de partes del servicio.',
    ],
  },
  {
    id: 'retencion',
    title: '5. Retención de datos',
    body: [
      'Conservamos tus datos mientras tu cuenta esté activa. Si cierras la cuenta, eliminamos la información personal salvo aquella que debamos retener por obligaciones contables, fiscales o legales.',
      'Las campañas finalizadas y los certificados de donación se conservan por el plazo legalmente exigido para conservar comprobantes.',
    ],
  },
  {
    id: 'derechos',
    title: '6. Tus derechos',
    body: [
      'Tienes derecho a acceder, rectificar y eliminar tus datos personales, así como a oponerte a determinados usos. Puedes ejercer estos derechos desde "Mi perfil" o escribiendo a privacidad@fondea.app.',
      'Si consideras que el tratamiento de tus datos no cumple con la normativa aplicable, puedes presentar una queja ante la autoridad de protección de datos competente.',
    ],
  },
  {
    id: 'seguridad',
    title: '7. Seguridad',
    body: [
      'Aplicamos medidas técnicas y organizativas razonables para proteger tu información: cifrado en tránsito, controles de acceso por rol y revisión periódica de proveedores.',
      'Ningún sistema es 100% seguro. Si detectas algún incidente de seguridad, contáctanos de inmediato en seguridad@fondea.app.',
    ],
  },
  {
    id: 'menores',
    title: '8. Menores de edad',
    body: [
      'Fondea no está dirigida a menores de edad. Si detectamos una cuenta perteneciente a un menor, procederemos a su cierre y eliminación de datos.',
    ],
  },
  {
    id: 'cambios',
    title: '9. Cambios en esta política',
    body: [
      'Podemos actualizar esta política para reflejar cambios legales, técnicos o de producto. Te notificaremos por correo electrónico o desde la plataforma cuando los cambios sean materiales.',
    ],
  },
] as const

export default function PrivacidadPage() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-12">
      <header className="flex flex-col gap-3">
        <span className="bg-muted text-muted-foreground inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          Documento legal
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Política de privacidad
        </h1>
        <p className="text-muted-foreground text-sm">Última actualización: {LAST_UPDATED}</p>
        <p className="text-muted-foreground text-sm">
          Esta política describe qué datos personales recolecta Fondea, cómo se utilizan y qué
          derechos tienes sobre ellos.
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
        ¿Necesitas más información?{' '}
        <Link href="/terminos" className="hover:text-foreground underline underline-offset-2">
          Consulta también los términos y condiciones
        </Link>
        .
      </footer>
    </div>
  )
}
