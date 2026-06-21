# Reporte de Integración Backend ↔ Frontend — Fondea

> Fecha: 2026-06-05
> Backend: `~/Workspace/fondea-backend` @ `develop` (pull aplicado, HEAD `c7095e9`)
> Frontend: `~/Workspace/fondea-frontend` @ `develop` (pull aplicado, HEAD `192d2d1`)
> Autor: análisis automatizado previo al hito de unión FE/BE

---

## 1. Resumen ejecutivo

**Veredicto: TODAVÍA NO se puede empezar la unión "tal cual". Hay un bloqueante duro y varias divergencias de contrato que resolver primero.**

El backend está razonablemente maduro: expone ~40 endpoints REST bajo `/api`, con JWT,
seguridad por rol, CORS abierto a `localhost:3000`, y un wrapper de respuesta uniforme
(`ApiResponse<T>`) que el frontend ya entiende. La capa de autenticación del frontend
**ya fue conectada al backend real** y su contrato coincide.

Sin embargo:

1. 🔴 **BLOQUEANTE: el frontend no compila.** `tsc --noEmit` arroja **41 errores en 26
   archivos**. La refactorización parcial hecha para conectar el login (PR #10) cambió los
   tipos `User`/`common.ts` pero dejó inconsistentes los mocks y varios componentes. Hay
   que estabilizar `develop` antes de cualquier integración.
2. 🟠 **Solo 1 de 13 servicios está conectado al backend real** (`auth.service`). Los otros
   12 siguen usando mocks en `localStorage`.
3. 🟠 **Divergencias de contrato de datos** importantes en el dominio principal (campañas,
   dinero, fechas, estados, slugs) entre los DTOs del backend y los `types` del frontend.
4. 🟡 **Conflicto conceptual del modelo de roles**: el FE asumía multi-rol por usuario; el
   backend impone rol único y estricto por sesión.

A continuación el detalle.

---

## 2. Estado de la conexión actual

### 2.1 Lo que YA funciona / coincide

| Aspecto | Estado | Notas |
|---|---|---|
| Cliente HTTP real | ✅ Creado | `src/lib/client.ts` — usa `NEXT_PUBLIC_API_URL` (default `http://localhost:8080`), inyecta `Authorization: Bearer`, parsea `ApiResponse<T>`, mapea status → errores tipados. |
| Wrapper de respuesta | ✅ Coincide | BE `ApiResponse<T>{success,data,message,timestamp,path}` ↔ FE `interface ApiResponse<T>` idéntico. |
| Token / sesión | ✅ | `tokenStore` en `localStorage` (`auth_token`); el FE arma `Session` con TTL local de 2h. |
| Enum de roles | ✅ Coincide | BE `ADMIN, CREATOR, SPONSOR` ↔ FE `type Role = 'ADMIN' \| 'CREATOR' \| 'SPONSOR'`. |
| `POST /api/auth/login` | ✅ | `LoginResponse{token,id,name,email,role,...}` ↔ `authService.login`. Campos extra del BE (createdAt, bio, city, country) se ignoran sin romper. |
| `POST /api/auth/register-creator` | ✅ | `authService.registerCreator`. |
| `POST /api/auth/register-sponsor` | ✅ | `authService.registerSponsor`. |
| `GET /api/auth/me` | ✅ | `MeDto` ↔ `User` (extra `isVerified`, `createdAt` ignorados). |
| CORS | ✅ | BE permite `http://localhost:3000`, métodos GET/POST/PUT/DELETE/PATCH/OPTIONS, header `Authorization`, `allowCredentials=true`. |

### 2.2 Lo que NO está conectado (sigue en mock)

`src/lib/api/index.ts` exporta 13 servicios. **Solo `auth.service` usa el cliente real
(`../client`).** Los demás importan del mock (`./client` → `MockStore`/`simulateNetwork` +
`./_stores`):

| Servicio FE | Cliente | Endpoint(s) BE disponibles |
|---|---|---|
| `auth.service` | 🟢 **REAL** | `/api/auth/*` |
| `campaigns.service` | 🔴 mock | `/api/campaigns` (CRUD, search, mine, featured, drafts, submit, {id}) |
| `categories.service` | 🔴 mock | `GET/POST /api/categories` |
| `pledges.service` | 🔴 mock | `POST /api/pledges`, `GET /api/pledges/mine` |
| `rewards.service` | 🔴 mock | `/api/campaigns/{id}/rewards` (+ `/manage`) |
| `faqs.service` | 🔴 mock | `/api/campaigns/{id}/faqs` (+ `/manage`, `/answer`) |
| `updates.service` | 🔴 mock | `/api/campaigns/{id}/updates` |
| `withdrawals.service` | 🔴 mock | `POST /api/withdrawals`, `GET /api/withdrawals/mine` |
| `certificates.service` | 🔴 mock | `GET /api/certificates/mine`, `/{id}` |
| `notifications.service` | 🔴 mock | `GET /api/notifications`, `/unread`, `PUT /read-all` |
| `fraud.service` | 🔴 mock | `POST /api/fraud-reports` |
| `admin.service` | 🔴 mock | `/api/admin/campaigns`, `/api/admin/fraud-reports`, `/api/admin/withdrawals` |
| `users.service` | 🔴 mock | (no hay endpoint público de usuarios; perfil vía `/api/auth/update-profile`) |

---

## 3. 🔴 BLOQUEANTE: el frontend no compila

`pnpm exec tsc --noEmit` → **41 errores / 26 archivos**. Causas raíz (todas derivadas de la
refactor parcial de auth en PR #10):

### 3.1 Se eliminó el tipo `ID` de `src/types/common.ts`
El diff del pull muestra `src/types/common.ts | 1 -`. El alias `export type ID = string`
fue borrado, pero **~15 archivos siguen importándolo** (`types/campaign.ts`,
`certificate.ts`, `faq.ts`, `fraud.ts`, `notification.ts`, `pledge.ts`, `reward.ts`,
`search.ts`, `update.ts`, `withdrawal.ts` y casi todos los `*.service.ts`).
→ `error TS2305: Module '"./common"' has no exported member 'ID'`.

**Fix sugerido:** re-agregar `export type ID = string` a `common.ts` (1 línea, desbloquea
la mayoría de los 41 errores).

### 3.2 El tipo `User` perdió campos que el resto del código aún usa
`User` ahora es `{ id, email, name, role, ...opcionales de stats }`. Se eliminaron
`roles`, `avatarUrl`, `location`, `bio`. Rompen:
- `components/profile/profile-form.tsx` → usa `avatarUrl`, `location`, `bio`, `roles`.
- `components/layout/user-avatar.tsx` y `user-menu.tsx` → usan `avatarUrl`.
- `lib/api/_mock-data/users.ts` → siembran `roles: [...]`.
- `lib/api/users.service.ts` → `UpdateUserPatch` referencia `location`, `bio`, `avatarUrl`.
- `lib/api/campaigns.service.ts` (líneas 131-144) → `creator.roles.includes('admin'/'creator')`.

### 3.3 `signUp` fue renombrado pero quedó una referencia vieja
`SessionProvider` ahora expone `signUpCreator` / `signUpSponsor`, pero
`components/auth/register-form.tsx:17` aún llama `signUp`.
→ `error TS2339: Property 'signUp' does not exist on type 'SessionContextValue'`.

> **Conclusión:** `develop` está en un estado intermedio roto. Antes de seguir integrando
> hay que decidir: (a) terminar la migración de tipos de forma consistente, o (b) restaurar
> los campos eliminados. Recomiendo (a), alineando los tipos al contrato real del backend.

---

## 4. Divergencias de contrato de datos (campañas — el dominio crítico)

El backend modela las campañas de forma bastante distinta a los `types` del frontend.
Estas diferencias afectan a `campaigns.service`, catálogo público, detalle, wizard de
creación y panel de creador.

| Concepto | Backend (DTO/modelo) | Frontend (`types/campaign.ts`) | Acción |
|---|---|---|---|
| **Dinero** | `BigDecimal goalAmount`, `totalPledged` (número plano, sin moneda) | `Money { amount, currency }` (`goal`, `raised`) | Adaptar: el FE asume objeto `Money`; el BE manda número. Decidir si el FE envuelve a `Money(USD)` en el cliente. |
| **Identificador en rutas** | Campañas por **UUID** únicamente | Rutas usan **`slug`** (`/campanas/[slug]`, `getBySlug`) | 🔴 El BE **no tiene `slug`**. O se agrega `slug` al backend, o el FE cambia a UUID en las rutas. |
| **Fechas** | `LocalDate deadline` (solo fin) + `daysLeft` calculado | `startDate`, `endDate`, `durationDays` | El FE espera inicio/fin/duración; el BE solo da `deadline`. Mapear `endDate ← deadline`. |
| **Tipo de meta** | `Boolean isFlexibleGoal` | `goalType: 'fixed' \| 'flexible'` | Mapear booleano ↔ unión de strings. |
| **Estados** | `DRAFT, UNDER_REVIEW, ACTIVE, SUCCESSFUL, FAILED` (MAYÚS) | `draft, pending_review, rejected, approved, active, successful, failed, cancelled` (minús) | 🔴 Distinto **casing** y distinto **conjunto**. El FE tiene `rejected/approved/cancelled` que el BE no maneja. Unificar el catálogo de estados. |
| **Conteo de apoyos** | `pledgeCount` | `backersCount` | Renombrar en mapeo. |
| **Categoría** | DTOs devuelven `categoryName` (string); detalle da `categoryId` | `categoryId` + `Category{id,slug,name,icon}` | El BE no expone `slug`/`icon` de categoría. |
| **Ubicación** | `locationId` + `city` (string) | `location: { city, country }` | El BE no devuelve `country` en el detalle; revisar `Location`. |
| **Destacado** | `Double featuredScore` | `boolean featured` | Mapear `featured ← featuredScore > 0` (o umbral). |
| **Multimedia** | `String imageUrl` (1 sola) | `coverImageUrl`, `gallery[]`, `videoUrl` | El BE solo tiene una imagen; FE espera galería + video. |
| **Campos ausentes en BE** | — | `summary`, `tags[]`, `approvedAt`, `rejectionReason`, `startDate` | El FE los usa (búsqueda por tags, resumen en tarjetas). Definir si se agregan al BE o se eliminan del FE. |

> La misma clase de divergencias aplica (en menor grado) a **pledges, withdrawals,
> certificates, notifications, rewards, faqs, fraud**. Conviene auditar cada `*Dto` del
> backend contra su `type` del frontend antes de migrar ese servicio.

---

## 5. Modelo de roles: conflicto conceptual

- **Frontend (diseño original):** multi-rol por usuario (un mismo usuario podía ser backer
  y creator; auto-promoción backer→creator al crear campaña; rol activo determinado por la
  URL). Vestigios visibles en `campaigns.service.create` (`creator.roles`, promueve a
  `creator`) y en los mocks (`roles: [...]`).
- **Backend (realidad):** **rol único** persistido en el usuario, validado de forma estricta
  con `hasRole(...)` en `SecurityConfig`. Registro separado por rol
  (`register-creator` vs `register-sponsor`). No existe `switchRole` ni promoción automática.

El `User` del frontend **ya migró** a `role: Role` (único), lo cual **alinea con el backend**
— pero dejó código mock inconsistente (sección 3.2). Hay que:
1. Confirmar la decisión de producto: **rol único** (recomendado, es lo que impone el BE).
2. Eliminar los vestigios multi-rol del FE (`roles[]`, auto-promoción, lógica por URL que
   asuma varios roles).

> Nota: el backend **sí** prohíbe que ADMIN cree campañas (no tiene `ROLE_CREATOR`), lo cual
> coincide con la intención del FE ("admin no crea campañas").

---

## 6. Configuración y entorno

### 6.1 Backend (`application.properties`)
Requiere `.env` con: `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` (PostgreSQL),
`JWT_SECRET`, `API_KEY`, `SERVER_PORT`, `ADMIN_NAME/EMAIL/PASSWORD`, y SMTP
(`MAIL_HOST/PORT/USERNAME/PASSWORD/FROM`). DDL en `update` (Hibernate auto-crea tablas).
Existe `AdminSeeder` que crea el admin inicial al arrancar.

- ⚠️ `SERVER_PORT` no tiene default; el cliente FE asume **8080**. Asegurar `SERVER_PORT=8080`
  en el `.env` del backend (o ajustar `NEXT_PUBLIC_API_URL`).
- ⚠️ El backend depende de un **SMTP real** (servicio de email) para verificación/notifs.
  Para desarrollo conviene un MailHog/Mailtrap o tolerar fallos de envío.

### 6.2 Frontend (`.env.example`)
- 🔴 **`NEXT_PUBLIC_API_URL` no está documentado** en `.env.example` (solo hay
  `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_APP_NAME`, `API_SECRET_KEY`, `DATABASE_URL`). El cliente
  real lo usa con fallback a `http://localhost:8080`. **Agregarlo al `.env.example`.**
- `CLAUDE.md` también lista las env vars viejas; conviene actualizarlo.

### 6.3 Detalle menor en el filtro JWT
`JwtAuthenticationFilter.shouldNotFilter` compara contra `"/auth/"`, pero la ruta real es
`/api/auth/`. No es un bug funcional (las rutas `POST /api/auth/**` son `permitAll` y sin
token el filtro deja pasar), pero el `shouldNotFilter` efectivamente nunca aplica. Anotarlo.

---

## 7. Mapa de endpoints del backend (referencia)

```
AUTH        POST /api/auth/login | /register-creator | /register-sponsor | /verify | /resend-verification
            GET  /api/auth/me        PUT /api/auth/update-profile
CAMPAIGNS   POST /api/campaigns      PUT /api/campaigns/{id}     POST /api/campaigns/{id}/submit
            GET  /api/campaigns/search | /{id} | /mine | /featured | /drafts
REWARDS     POST/GET /api/campaigns/{id}/rewards   GET /manage   DELETE /{rewardId}
FAQS        POST/GET /api/campaigns/{id}/faqs   PUT /{faqId}/answer   GET /manage   DELETE /{faqId}
UPDATES     POST/GET /api/campaigns/{id}/updates   DELETE /{id}
PLEDGES     POST /api/pledges        GET /api/pledges/mine
WITHDRAWALS POST /api/withdrawals    GET /api/withdrawals/mine
CERTS       GET  /api/certificates/mine | /{id}
NOTIFS      GET  /api/notifications | /unread     PUT /api/notifications/read-all
FRAUD       POST /api/fraud-reports
CATEGORIES  GET /api/categories (público)   POST/PUT/DELETE (ADMIN)
LOCATIONS   GET /api/locations  (público)   POST/PUT/DELETE (ADMIN)
ADMIN       GET /api/admin/campaigns/pending     POST /{id}/approve | /reject
            GET /api/admin/fraud-reports         POST /{id}/review
            GET /api/admin/withdrawals/pending   POST /{id}/approve | /reject
```

Reglas de seguridad (resumen): `POST /api/auth/**` y `GET` de
`campaigns/categories/locations` son públicos; el resto requiere JWT y, en muchos casos, rol
específico (`CREATOR` para crear/gestionar campañas y retiros; `SPONSOR` para pledges,
certificados y reportes de fraude; `ADMIN` para todo `/api/admin/**`).

---

## 8. Plan de acción recomendado (orden sugerido)

### Fase 0 — Desbloquear `develop` (imprescindible, ~½ día)
1. [ ] Re-agregar `export type ID = string` a `src/types/common.ts`.
2. [ ] Decidir el `User` definitivo (alineado al BE) y actualizar de forma consistente:
       `profile-form`, `user-avatar`, `user-menu`, `users.service`, mocks `_mock-data/users`.
3. [ ] Arreglar `register-form.tsx` (`signUp` → `signUpSponsor`/`signUpCreator`).
4. [ ] Eliminar vestigios multi-rol (`roles[]`, auto-promoción) de `campaigns.service` y mocks.
5. [ ] `pnpm exec tsc --noEmit` limpio + `pnpm lint` + `pnpm build`. **Gate de la fase.**

### Fase 1 — Cerrar el contrato de datos (½–1 día)
6. [ ] Auditar cada `*Dto` del BE vs `type` del FE (empezar por **Campaign**).
7. [ ] Acordar decisiones de divergencia: `slug` (¿BE lo agrega?), estados (casing + set),
       `Money` (¿FE envuelve número en `{amount, currency:'USD'}`?), `featured` vs
       `featuredScore`, multimedia (1 imagen vs galería).
8. [ ] Documentar el contrato final (este doc o un OpenAPI/Swagger del backend).

### Fase 2 — Migrar servicios al cliente real (incremental, 1 por vez)
Sugerencia de orden por valor y dependencia:
9.  [ ] `categories.service` + `locations` (simples, públicos, sin auth) — buen primer caso.
10. [ ] `campaigns.service` (catálogo `/search`, detalle `/{id}`, `featured`).
11. [ ] `campaigns` de creador (`/mine`, `/drafts`, crear/editar/submit) + `rewards`/`faqs`/`updates`.
12. [ ] `pledges.service` (flujo sponsor) + `certificates`.
13. [ ] `withdrawals.service`.
14. [ ] `notifications.service`.
15. [ ] `fraud.service`.
16. [ ] `admin.service` (3 controllers admin).
> Mantener los mocks detrás de un flag mientras se migra cada servicio, para no romper UI.

### Fase 3 — Entorno y verificación end-to-end
17. [ ] Agregar `NEXT_PUBLIC_API_URL` al `.env.example` y actualizar `CLAUDE.md`.
18. [ ] Levantar BE (PostgreSQL + `SERVER_PORT=8080` + SMTP de dev) y FE juntos.
19. [ ] Smoke test del happy path: registro → login → `me` → listar campañas → crear (creator)
        → pledge (sponsor) → flujo admin.

---

## 9. Conclusión

La **autenticación ya está integrada y su contrato calza** — es una excelente base. Pero el
hito de "unión FE/BE" **no debe arrancar todavía** porque (1) `develop` no compila y (2) el
resto del dominio aún vive en mocks con contratos divergentes.

El camino crítico es corto y claro: **estabilizar `develop` (Fase 0)** y **cerrar el contrato
de campañas (Fase 1)**. Con eso resuelto, la migración servicio por servicio (Fase 2) es
mecánica y de bajo riesgo, porque la infraestructura (cliente real, `ApiResponse`, JWT, CORS,
errores tipados) ya existe y funciona.
