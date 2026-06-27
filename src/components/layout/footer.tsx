import Link from 'next/link'
import { Logo } from './logo'

interface FooterColumn {
  title: string
  links: { href: string; label: string; external?: boolean }[]
}

const COLUMNS: FooterColumn[] = [
  {
    title: 'Explorar',
    links: [
      { href: '/explorar', label: 'Todas las campañas' },
      { href: '/categorias/tecnologia', label: 'Tecnología' },
      { href: '/categorias/arte', label: 'Arte y diseño' },
      { href: '/categorias/comunidad', label: 'Comunidad' },
    ],
  },
  {
    title: 'Creadores',
    links: [
      { href: '/como-funciona', label: 'Cómo funciona' },
      { href: '/creador/campanas/nueva', label: 'Iniciar una campaña' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/terminos', label: 'Términos' },
      { href: '/privacidad', label: 'Privacidad' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-border border-t">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid gap-8 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div className="flex flex-col gap-3">
            <Logo />
            <p className="text-muted-foreground max-w-xs text-sm">
              Plataforma de financiamiento colectivo con modelo todo-o-nada.
            </p>
          </div>
          {COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-2 text-sm">
              <h3 className="text-foreground font-medium">{column.title}</h3>
              <ul className="flex flex-col gap-1.5">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-border text-muted-foreground mt-10 flex flex-col items-start justify-between gap-2 border-t pt-6 text-xs sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Fondea. Todos los derechos reservados.</p>
          <p>Hecho con Next.js</p>
        </div>
      </div>
    </footer>
  )
}
