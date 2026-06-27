import Link from 'next/link'
import { Logo } from '@/components/layout/logo'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="px-4 py-4">
        <Logo />
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        className="flex flex-1 items-center justify-center px-4 py-8"
      >
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="text-muted-foreground px-4 py-6 text-center text-xs">
        <Link href="/terminos" className="hover:text-foreground">
          Términos
        </Link>
        <span className="mx-2">·</span>
        <Link href="/privacidad" className="hover:text-foreground">
          Privacidad
        </Link>
      </footer>
    </div>
  )
}
