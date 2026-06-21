# Guía de desarrollo — Fondea Frontend


## 1. Qué es esto

Fondea es una plataforma de crowdfunding. Este repo es **solo el frontend** del MVP:
una SPA/SSR en Next.js que ya implementa todas las pantallas y flujos end-to-end
contra una **capa de servicios mock** que persiste en `localStorage`. No hay backend:
cuando exista, se reemplaza la implementación de `src/lib/api/` por llamadas HTTP
reales **sin tocar las vistas**.

Implicaciones prácticas para un dev nuevo:

- No necesitas levantar ninguna base de datos ni API: clonas, instalas y corre.
- Los datos son semilla (`seed`) en código y se pueden resetear.
- Toda la "lógica de negocio" que ves en `src/lib/api/` es **simulación de
  presentación**; las decisiones reales (cobros, anti-fraude, etc.) son del backend
  futuro. No metas reglas de negocio reales en el frontend.

---

## 2. Stack

| Pieza             | Versión / detalle                                                        |
| ----------------- | ------------------------------------------------------------------------ |
| Framework         | **Next.js 16** (App Router)                                               |
| UI runtime        | **React 19**                                                             |
| Estilos           | **Tailwind CSS v4** — config CSS-first, **sin** `tailwind.config.*`       |
| Componentes       | **shadcn/ui** sobre **Base UI** (`@base-ui/react`) — **no** Radix         |
| Iconos            | `lucide-react`                                                            |
| Tema claro/oscuro | `next-themes` (`attribute="class"`, default `system`)                     |
| Toasts            | `sonner`                                                                  |
| Lenguaje          | TypeScript `strict` + `noUncheckedIndexedAccess`                          |
| Gestor de paquetes| **pnpm** (lockfile `pnpm-lock.yaml`)                                       |

No hay test runner configurado.

---

## 3. Arranque rápido

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

Otros scripts (de `package.json`):

| Comando              | Qué hace                              |
| -------------------- | ------------------------------------- |
| `pnpm dev`           | Dev server con hot reload             |
| `pnpm build`         | Build de producción                   |
| `pnpm start`         | Sirve el build de producción          |
| `pnpm lint`          | ESLint (flat config `eslint.config.mjs`) |
| `pnpm format`        | Prettier --write                      |
| `pnpm format:check`  | Prettier --check (no escribe)         |

**Antes de abrir PR:** `pnpm lint` y `pnpm format:check` deben pasar limpio.

### Variables de entorno

`.env.example` documenta lo esperado: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME`,
`API_SECRET_KEY`, `DATABASE_URL`. Para desarrollo local del MVP no son necesarias
(todo es mock). `.env.local` está gitignored.

---

## 4. Estructura del proyecto

```
src/
├── app/                      # App Router: rutas, layouts, error/not-found
│   ├── layout.tsx            # root: fonts, ThemeProvider, SessionProvider, Toaster, skip-link
│   ├── (public)/             # route group público (navbar público + footer)
│   ├── auth/                 # login / registro (layout centrado)
│   ├── dashboard/            # área backer (auth)
│   ├── creador/              # área creator (auth + rol)
│   ├── admin/                # área admin (auth + rol)
│   ├── perfil/               # perfil compartido entre roles (auth)
│   ├── error.tsx             # error boundary global
│   └── not-found.tsx         # 404
├── components/
│   ├── ui/                   # primitivos shadcn (NO editar a mano, ver §8)
│   ├── layout/               # navbars, sidebars, footer, avatar, shell autenticado
│   ├── providers/            # ThemeProvider, SessionProvider
│   ├── common/               # EmptyState, ErrorState, ConfirmDialog, skeletons, MoneyDisplay
│   ├── campaigns/ pledges/ creator/ admin/ auth/ profile/ ...  # features por dominio
├── lib/
│   ├── api/                  # ⭐ capa de servicios mock (ver §6)
│   ├── auth-routing.ts       # rol → ruta, etiquetas, guard por path
│   ├── money.ts              # helpers de Money (centavos)
│   ├── dates.ts              # helpers de fechas
│   ├── constants.ts          # comisión, page size, límites, umbrales
│   ├── wizard-helpers.ts     # utilidades del wizard de campaña
│   └── utils.ts              # cn() (clsx + tailwind-merge)
├── types/                    # tipos de dominio (un tipo por entidad)
├── config/site.ts            # config de sitio
└── app/globals.css           # tokens de diseño Tailwind v4 (@theme inline) + variante dark
```

Alias de import: `@/*` → `src/*`. Úsalo siempre en lugar de rutas relativas largas.

### Convención de páginas

Las páginas de `app/` son **finas**: importan y renderizan el componente de feature.
La lógica vive en `src/components/<dominio>/`. Ejemplo real:

```tsx
// src/app/creador/page.tsx
import { CreatorDashboard } from '@/components/creator/creator-dashboard'

export default function CreatorHomePage() {
  return <CreatorDashboard />
}
```

---

## 5. Modelo de dominio (`src/types/`)

Reglas globales (ver memoria del equipo y `mvp-frontend.md`):

- **Un solo tipo por entidad** — no hay separación DTO ↔ dominio.
- **Identificadores en inglés; copy de UI en español.** `ROLE_LABEL` puentea ambos.
- Montos en **centavos enteros**, moneda **USD únicamente**.

Tipos base (`types/common.ts`):

```ts
type ID = string
type ISODateString = string
type Currency = 'USD'
interface Money { amount: number; currency: Currency }   // amount en centavos
interface Paginated<T> { items: T[]; page; pageSize; total; hasMore }
```

Entidades principales: `User`/`Session`/`Role` (`user.ts`), `Campaign`/`Category`/
`CampaignDraft`/`CampaignSummary` (`campaign.ts`), y `reward`, `pledge`, `update`,
`faq`, `fraud`, `withdrawal`, `certificate`, `notification`, `search`. Todo se
re-exporta desde `types/index.ts`, así que importa de `@/types`.

Notas que ahorran sorpresas:

- `Role = 'admin' | 'creator' | 'backer'`. Un usuario tiene `roles: Role[]` (multi-rol).
- `CampaignStatus`: `draft → pending_review → (rejected | approved) → active →
  (successful | failed)`, más `cancelled`.
- `CampaignDraft` **no incluye `slug`** — el slug lo genera el backend.
- `noUncheckedIndexedAccess` está activo: `arr[i]` es `T | undefined`. Narrow antes
  de usar.

---

## 6. Capa de servicios mock (`src/lib/api/`) — el corazón del proyecto

Esta es la parte que **debes entender bien**. Las vistas nunca tocan `localStorage`
ni datos hardcoded: siempre pasan por un service. Cuando llegue el backend real, se
cambia el interior de estos services y la UI no se entera.

### 6.1 Estructura

```
lib/api/
├── index.ts            # punto de entrada público — importa SIEMPRE desde '@/lib/api'
├── client.ts           # MockStore, latencia simulada, paginate, ids, sesión raw
├── _stores.ts          # instancias de MockStore por entidad + resetAllStores()
├── errors.ts           # ApiError y subclases tipadas
├── *.service.ts        # un service por dominio (auth, campaigns, pledges, ...)
└── _mock-data/         # datos semilla (SEED_*) por entidad
```

Importa siempre desde el barrel:

```ts
import { campaignsService, ApiError, usersService } from '@/lib/api'
```

### 6.2 `MockStore` (en `client.ts`)

Un `MockStore<T extends { id: string }>` es un array en memoria espejado a
`localStorage` bajo la clave `fondea:mock:<key>`:

- Al construirse hidrata desde `localStorage`; si no hay nada, persiste la semilla.
- API CRUD: `all()`, `filter()`, `find()`, `findById()`, `insert()`, `update(id, patch)`,
  `remove(id)`, `reset()`.
- Cada mutación re-persiste a `localStorage` (sobrevive al reload).
- Es **SSR-safe**: si `window` es `undefined` no toca storage.

Las instancias viven en `_stores.ts` (`usersStore`, `campaignsStore`, etc.).
`resetAllStores()` restaura todas las semillas — útil para volver a estado limpio.

### 6.3 Simulación de red

`client.ts` expone:

- `simulateNetwork()` — `await` al inicio de cada método de service. Aplica latencia
  (`mockConfig.latencyMs`, default 200 ms) y, si se pidió, lanza un error simulado.
- `setMockLatency(ms)` — ajusta la latencia global.
- `failNext(code)` — hace que **la siguiente** llamada falle con ese `ApiErrorCode`.
  Ideal para probar estados de error en la UI a mano desde la consola del navegador.
- `generateId()`, `nowISO()`, `paginate(items, page, pageSize)`.

### 6.4 Anatomía de un service

Todos siguen el mismo patrón: `await simulateNetwork()`, valida, opera sobre el store,
devuelve el tipo de dominio (o lanza un `ApiError`). Ejemplo (`auth.service.ts`):

```ts
export const authService = {
  async login({ email, password }: LoginInput): Promise<Session> {
    await simulateNetwork()
    if (!email || !password) throw new ValidationError('Email y contraseña son obligatorios')
    const user = usersStore.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (!user) throw new UnauthorizedError('Credenciales inválidas')
    const session = buildSession(user)
    writeSessionRaw(session)
    return session
  },
  // register, logout, getCurrentSession, addRole ...
}
```

> **Login mock:** valida solo que el email exista en la semilla. La contraseña se
> ignora (no hay hashing). Cualquier password funciona.

### 6.5 Errores (`errors.ts`)

`ApiError` con `code: ApiErrorCode` y subclases: `ValidationError` (incluye `fields`),
`UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`. En la UI:

```ts
try {
  await usersService.updateProfile(id, patch)
} catch (err) {
  const message = err instanceof ApiError ? err.message : 'No pudimos guardar los cambios'
  toast.error(message)
}
```

### 6.6 Cómo agregar un service nuevo

1. Define/extiende el tipo en `src/types/` y re-expórtalo en `types/index.ts`.
2. Crea `SEED_*` en `lib/api/_mock-data/` y expórtalo en `_mock-data/index.ts`.
3. Registra el `MockStore` en `_stores.ts` (y añádelo a `resetAllStores`).
4. Crea `xxx.service.ts` siguiendo el patrón (§6.4): empieza con `await simulateNetwork()`.
5. Expón el service (y sus tipos de input) en `lib/api/index.ts`.
6. Consúmelo desde el componente; nunca toques el store directamente desde la vista.

---

## 7. Autenticación, sesión y roles

### 7.1 `SessionProvider` (`components/providers/session-provider.tsx`)

Provider cliente que envuelve toda la app (montado en el root layout). Expone vía
`useSession()`:

```ts
const { session, user, isLoading, signIn, signUp, signOut, refresh, hasRole } = useSession()
```

Al montar lee la sesión actual con `authService.getCurrentSession()` (que re-hidrata
el `user` fresco desde el store, no el snapshot cacheado).

### 7.2 Protección de rutas — `AuthenticatedShell`

No hay middleware. La protección es **cliente**, en `components/layout/authenticated-shell.tsx`.
Cada layout autenticado lo usa y declara el rol requerido:

```tsx
// src/app/creador/layout.tsx
<AuthenticatedShell requiredRole="creator" sidebar={<CreatorSidebar />}>
  {children}
</AuthenticatedShell>
```

El shell:

- Si no hay sesión → redirige a `/auth/login`.
- Si hay sesión pero falta el `requiredRole` → redirige a `getPrimaryPath(user)`.
- Mientras `isLoading` muestra un spinner accesible.
- Monta el navbar autenticado + sidebar y el `<main id="main-content">`.

### 7.3 Routing por rol (`lib/auth-routing.ts`)

- `getPrimaryPath(user)` — panel primario por prioridad **admin > creator > backer**.
- `ROLE_HOME` — mapa `rol → ruta home`.
- `ROLE_LABEL` — etiqueta en español (puente naming inglés ↔ UI español).
- `requiredRoleForPath(pathname)` — qué rol exige una ruta.

### 7.4 Multi-rol

Un usuario puede tener varios roles. La promoción `backer → creator` ocurre cuando
crea su primera campaña (`authService.addRole`). El rol activo se infiere de la
**URL / área** en la que estás, no de un `switchRole` global.

### 7.5 Usuarios semilla (para login de prueba)

Cualquier contraseña sirve. Emails disponibles:

| Email                | Roles                | Para probar                          |
| -------------------- | -------------------- | ------------------------------------ |
| `admin@fondea.app`   | admin                | Panel admin                          |
| `carla@fondea.app`   | creator, backer      | Creador con historial + multi-rol    |
| `cesar@fondea.app`   | creator (nuevo)      | Límite diario de retiro (creador nuevo) |
| `beto@example.com`   | backer               | Flujo de patrocinador                |
| `bea@example.com`    | backer               | Patrocinador                         |
| `bruno@example.com`  | backer, creator      | Multi-rol                            |

---

## 8. UI, estilos y componentes

### 8.1 Primitivos shadcn (`components/ui/`)

Son generados. **No los edites a mano**; regenera/añade con:

```bash
pnpm dlx shadcn@latest add <component>
```

`components.json` fija: style `base-nova`, icon library `lucide`, base color
`neutral`, RSC habilitado. Aliases: `@/components`, `@/components/ui`, `@/lib`,
`@/lib/utils`, `@/hooks`.

### 8.2 Tailwind v4 (CSS-first)

No hay `tailwind.config.*`. Los tokens de diseño (colores, radios, fuentes) y la
variante `dark` se definen en `src/app/globals.css` dentro de `@theme inline`.
**Edita los tokens ahí**, no en JS.

### 8.3 `cn()` para clases condicionales

Usa siempre `cn()` de `@/lib/utils` (clsx + tailwind-merge) para componer className
condicional. `prettier-plugin-tailwindcss` reordena las clases automáticamente al
formatear.

### 8.4 Dinero en pantalla

Formatea **solo** con los helpers de `lib/money.ts` (centavos → `$XX.XX`) o el
componente `MoneyDisplay`. No hagas `toFixed` ad-hoc. `formatMoney` divide entre 100
y usa `Intl.NumberFormat`. Para operar: `addMoney`, `multiplyMoney`, `compareMoney`,
`progressRatio` (todos validan misma moneda).

### 8.5 Imágenes

No hay carga de archivos ni storage. Avatares y portadas de campaña se manejan con
**URL pública** en un `<input type="url">`. Si el avatar está vacío, `UserAvatar`
cae a iniciales. Se renderiza con `<img>` plano (no `next/image`, por ahora). Ver
`profile-form.tsx` y `wizard/step-basics.tsx`.

### 8.6 Estados de UI obligatorios

Toda vista que consuma un service debe manejar explícitamente:

- **Loading** → skeleton específico (`components/common/*-skeleton`, `PageSkeleton`),
  no spinners genéricos.
- **Empty** → `EmptyState` con CTA contextual.
- **Error** → `ErrorState` con botón reintentar.
- **Validación de formularios** → errores inline por campo + `aria-invalid`/`aria-describedby`.
- **Éxito** → toast `sonner` (acciones sin navegación) o navegación + flash.

### 8.7 Accesibilidad

Patrón ya establecido en el repo: skip-link (`#main-content`) en el root layout,
`role`/`aria-live` en estados de carga, `sr-only` para texto solo-lector, `<main>`
con `tabIndex={-1}`. Mantén ese nivel en componentes nuevos.

---

## 9. Constantes de negocio (presentación)

De `lib/constants.ts` — son valores de **presentación** (el backend tendrá la verdad):

| Constante                                  | Valor      | Uso                                  |
| ------------------------------------------ | ---------- | ------------------------------------ |
| `COMMISSION_RATE`                          | `0.05`     | Comisión 5% mostrada en retiros      |
| `DEFAULT_PAGE_SIZE`                        | `12`       | Paginación                           |
| `MIN/MAX_CAMPAIGN_DURATION_DAYS`           | `7` / `90` | Validación de duración en el wizard  |
| `NEAR_GOAL_THRESHOLD`                      | `0.8`      | Alerta "cerca de la meta" (80%)      |
| `NEW_CREATOR_DAILY_WITHDRAWAL_LIMIT_CENTS` | `5 000 000`| Límite diario de retiro creador nuevo|

---

## 10. Convenciones de código

Prettier (no negociable, se autoformatea):

- Sin punto y coma, comillas simples, indent 2 espacios, `printWidth: 100`,
  trailing commas `es5`.

ESLint: `no-unused-vars`, `no-explicit-any` y `react/self-closing-comp` están como
**warnings**, no errors. Aun así, evita `any`.

Naming / idioma:

- Identificadores (variables, funciones, tipos, archivos) en **inglés**.
- Copy visible para el usuario en **español**.
- Sin `console.log` ni `TODO` sueltos en lo que se mergea.

---

## 11. Flujo de Git

Convención del equipo (importante respetarla):

1. **Antes de implementar:** `git checkout develop && git pull && git checkout -b <rama>`.
   La rama base es `develop`, no `main`.
2. **Nombres de rama:** prefijos `feature/`, `fix/`, `test/`, `chore/`, `refactor/`.
3. **Mensajes de commit en inglés** (subject + body), estilo conventional commits
   (`feat(scope): ...`, `fix(scope): ...`). Mira el historial para el estilo.
4. Los PR van contra `develop`; `main` se actualiza vía merge de release.

---

## 12. Definition of Done (por feature)

Una página/feature está lista para integrar con backend cuando:

- [ ] Consume la capa de servicios mock (sin datos hardcoded en el componente).
- [ ] Maneja loading / empty / error explícitamente.
- [ ] Es responsive (mobile/tablet/desktop) y respeta tema claro/oscuro.
- [ ] Tiene roles correctamente protegidos.
- [ ] Formularios con validación cliente y mensajes claros.
- [ ] No introduce lógica de negocio del backend (cálculos como la comisión son
      presentación, no decisiones).
- [ ] Pasa `pnpm lint` y `pnpm format:check`.
- [ ] Sin `console.log` ni `TODO` sin issue asociado.

---

## 13. Trampas conocidas / FAQ rápida

- **"Mis cambios de datos no se ven."** Están en `localStorage` (`fondea:mock:*`).
  Bórralo desde DevTools o llama `resetAllStores()` para volver a la semilla.
- **"Quiero probar un error de red."** En consola del navegador, antes de la acción:
  importa o usa `failNext('not_found')` vía el service expuesto, o sube la latencia
  con `setMockLatency(2000)` para ver skeletons.
- **`arr[i]` da `T | undefined`.** Es `noUncheckedIndexedAccess`; narrow antes de usar.
- **No edites `components/ui/` a mano.** Regenera con shadcn.
- **No hay tests.** No existe runner; la verificación es manual + lint + format.
- **Login ignora la contraseña.** Es mock; cualquier password con un email semilla entra.
```
