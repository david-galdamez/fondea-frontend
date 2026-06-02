'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError } from '@/lib/api'
import { getPrimaryPath } from '@/lib/auth-routing'
import { useSession } from '@/components/providers/session-provider'

export function LoginForm() {
  const { signIn } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const session = await signIn({ email, password })
      toast.success(`Hola, ${session.user.name}`)
      router.push(redirectTo ?? getPrimaryPath(session.user))
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : 'No pudimos iniciar tu sesión. Intenta de nuevo.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Iniciar sesión</h1>
        <p className="text-muted-foreground text-sm">
          Entra a tu cuenta para apoyar campañas o gestionar las tuyas.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
      </div>

      {error && (
        <p
          role="alert"
          className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
        >
          {error}
        </p>
      )}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Iniciando…' : 'Iniciar sesión'}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        ¿No tienes cuenta?{' '}
        <Link href="/auth/registro" className="text-foreground font-medium hover:underline">
          Regístrate
        </Link>
      </p>
    </form>
  )
}
