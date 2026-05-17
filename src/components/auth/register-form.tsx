'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ApiError, ValidationError } from '@/lib/api'
import { getPrimaryPath } from '@/lib/auth-routing'
import { useSession } from '@/components/providers/session-provider'

type InitialRole = 'creator' | 'backer'

export function RegisterForm() {
  const { signUp } = useSession()
  const router = useRouter()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [initialRole, setInitialRole] = useState<InitialRole>('backer')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setFieldErrors({})
    setSubmitting(true)
    try {
      const session = await signUp({ name, email, password, initialRole })
      toast.success(`Bienvenido, ${session.user.name}`)
      router.push(getPrimaryPath(session.user))
    } catch (err) {
      if (err instanceof ValidationError && err.fields) {
        setFieldErrors(err.fields)
      }
      const message =
        err instanceof ApiError ? err.message : 'No pudimos crear tu cuenta. Intenta de nuevo.'
      setError(message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Crear cuenta</h1>
        <p className="text-muted-foreground text-sm">
          Empieza a apoyar o crear campañas de financiamiento colectivo.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="name">Nombre</Label>
          <Input
            id="name"
            type="text"
            autoComplete="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre completo"
            aria-invalid={!!fieldErrors.name}
          />
        </div>
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
            aria-invalid={!!fieldErrors.email}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mínimo 6 caracteres"
            aria-invalid={!!fieldErrors.password}
          />
        </div>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">¿Cómo vas a usar Fondea?</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <label
            data-active={initialRole === 'backer'}
            className="border-border data-[active=true]:border-primary data-[active=true]:bg-primary/5 flex cursor-pointer flex-col gap-1 rounded-lg border p-3 text-sm transition-colors"
          >
            <input
              type="radio"
              name="initialRole"
              value="backer"
              checked={initialRole === 'backer'}
              onChange={() => setInitialRole('backer')}
              className="sr-only"
            />
            <span className="font-medium">Apoyar campañas</span>
            <span className="text-muted-foreground text-xs">
              Promete donaciones y obtén recompensas.
            </span>
          </label>
          <label
            data-active={initialRole === 'creator'}
            className="border-border data-[active=true]:border-primary data-[active=true]:bg-primary/5 flex cursor-pointer flex-col gap-1 rounded-lg border p-3 text-sm transition-colors"
          >
            <input
              type="radio"
              name="initialRole"
              value="creator"
              checked={initialRole === 'creator'}
              onChange={() => setInitialRole('creator')}
              className="sr-only"
            />
            <span className="font-medium">Crear campañas</span>
            <span className="text-muted-foreground text-xs">
              Lanza tu propio proyecto de financiamiento colectivo.
            </span>
          </label>
        </div>
      </fieldset>

      {error && (
        <p
          role="alert"
          className="border-destructive/30 bg-destructive/10 text-destructive rounded-md border px-3 py-2 text-sm"
        >
          {error}
        </p>
      )}

      <Button type="submit" disabled={submitting} className="w-full">
        {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
      </Button>

      <p className="text-muted-foreground text-center text-sm">
        ¿Ya tienes cuenta?{' '}
        <Link href="/auth/login" className="text-foreground font-medium hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  )
}
