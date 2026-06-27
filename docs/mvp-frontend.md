# Requerimientos del MVP — Frontend Fondea

Documento de alcance del **producto mínimo funcional** del frontend de Fondea (plataforma de crowdfunding). Sirve como checklist de páginas, navegación, componentes y flujos antes de implementar. La fuente de verdad del producto es `~/Workspace/proyecto_ncapas.md`.

> **Alcance:** solo frontend. Toda la lógica de negocio (cobros, emails, generación de RSS/CSV/Sheets, algoritmos de destacado, validación real anti-fraude) vive en el backend futuro. La UI consume la capa de servicios mock (`src/lib/api/`) que después se reemplaza por llamadas reales sin tocar las vistas.

---

## 1. Objetivo del MVP

Un usuario debe poder, end-to-end en la UI (con datos mock persistidos en `localStorage`):

1. Descubrir campañas (landing + explorar + filtros por categoría/ubicación).
2. Ver el detalle de una campaña con recompensas, actualizaciones y FAQ.
3. Registrarse / iniciar sesión y elegir/cambiar de rol.
4. Como **patrocinador**: prometer una donación con o sin recompensa, ver sus pledges, recibir notificaciones, descargar certificado de donación, reportar fraude.
5. Como **creador**: crear una campaña (wizard multi-paso), enviarla a revisión, publicar actualizaciones, gestionar FAQs, solicitar retiro (viendo comisión del 5% y límite diario si es nuevo).
6. Como **administrador**: revisar la cola de validación, aprobar/rechazar campañas, marcar destacadas, resolver reportes de fraude.

---

## 2. Decisiones técnicas confirmadas

| Decisión              | Valor                                                               |
| --------------------- | ------------------------------------------------------------------- |
| Montos                | Enteros en **centavos** (`Money.amount: number`, `currency: 'USD'`) |
| Moneda MVP            | **USD únicamente**                                                  |
| Multi-rol             | Sí — `User.roles: Role[]`                                           |
| Persistencia mocks    | **localStorage** (sobrevive reload)                                 |
| Slugs de campaña      | Los genera el **backend** — `CampaignDraft` no incluye `slug`       |
| Tipos                 | **Un solo tipo por entidad** (no DTO ↔ dominio)                     |
| Idioma                | Español (`<html lang="es">`)                                        |
| UI                    | shadcn/ui sobre Base UI + Tailwind v4 (ya configurado)              |
| Notificaciones in-app | `sonner` (toasts) + página de notificaciones                        |
| Theming               | `next-themes` (claro/oscuro/system, ya configurado)                 |

---

## 3. Mapa de rutas (App Router)

Convención: rutas públicas en raíz, áreas autenticadas bajo segmento por rol. Se usa `route groups` para layouts.

### 3.1 Públicas (sin auth)

| Ruta                 | Propósito                                                                                            |
| -------------------- | ---------------------------------------------------------------------------------------------------- |
| `/`                  | Landing: hero, campañas destacadas, categorías, cómo funciona, CTA crear campaña                     |
| `/explorar`          | Listado con filtros (categoría, ubicación, estado, ordenamiento) y paginación                        |
| `/categorias/[slug]` | Listado pre-filtrado por categoría                                                                   |
| `/campanas/[slug]`   | Detalle de campaña pública (descripción, recompensas, updates públicas, FAQ, progreso, botón apoyar) |
| `/como-funciona`     | Página informativa estática (modelo todo-o-nada, comisión, garantías)                                |
| `/auth/login`        | Inicio de sesión                                                                                     |
| `/auth/registro`     | Registro (selección inicial de rol creator/backer; admin no se auto-registra)                        |
| `/terminos`          | Placeholder estático                                                                                 |
| `/privacidad`        | Placeholder estático                                                                                 |

### 3.2 Patrocinador (auth + rol `backer`)

| Ruta                        | Propósito                                                                                  |
| --------------------------- | ------------------------------------------------------------------------------------------ |
| `/campanas/[slug]/apoyar`   | Flujo de pledge: elegir recompensa (o monto libre) → confirmar → resultado                 |
| `/dashboard`                | Resumen del backer: campañas apoyadas, próximos cobros estimados, notificaciones recientes |
| `/dashboard/pledges`        | Lista de promesas con estado (`pending`, `authorized`, `charged`, `refunded`)              |
| `/dashboard/pledges/[id]`   | Detalle de pledge + recibo                                                                 |
| `/dashboard/certificados`   | Certificados de donación por año fiscal (descarga stub)                                    |
| `/dashboard/notificaciones` | Centro de notificaciones                                                                   |
| `/perfil`                   | Editar perfil (nombre, avatar, ubicación, bio) — compartido entre roles                    |

### 3.3 Creador (auth + rol `creator`)

| Ruta                                           | Propósito                                                                                 |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `/creador`                                     | Dashboard: campañas activas, fondos disponibles, próximas fechas de cierre                |
| `/creador/campanas`                            | Lista de mis campañas con estado                                                          |
| `/creador/campanas/nueva`                      | **Wizard de creación** (multi-step, ver 6.2)                                              |
| `/creador/campanas/[id]/editar`                | Editar borrador (solo en estado `draft` o `rejected`)                                     |
| `/creador/campanas/[id]/actualizaciones`       | Lista y publicación de updates                                                            |
| `/creador/campanas/[id]/actualizaciones/nueva` | Editor de update (público / solo backers)                                                 |
| `/creador/campanas/[id]/patrocinadores`        | Lista de quien apoyó (con respeto a anónimos)                                             |
| `/creador/campanas/[id]/preguntas`             | Gestión de FAQs                                                                           |
| `/creador/retiros`                             | Historial de retiros + solicitud de nuevo retiro (UI muestra comisión 5% y límite diario) |

### 3.4 Administrador (auth + rol `admin`)

| Ruta                     | Propósito                                                                   |
| ------------------------ | --------------------------------------------------------------------------- |
| `/admin`                 | Dashboard: pendientes de revisión, reportes abiertos, comisiones acumuladas |
| `/admin/validacion`      | Cola de campañas en `pending_review`                                        |
| `/admin/validacion/[id]` | Revisar campaña y aprobar / rechazar (con motivo) / marcar destacada        |
| `/admin/campanas`        | Todas las campañas con filtros y toggle destacada                           |
| `/admin/fraude`          | Lista de reportes de fraude (filtrar por estado)                            |
| `/admin/fraude/[id]`     | Detalle de reporte y resolución                                             |
| `/admin/usuarios`        | Listado básico de usuarios (solo lectura en MVP)                            |

### 3.5 Acciones / utilitarias

| Ruta                        | Propósito                                                                       |
| --------------------------- | ------------------------------------------------------------------------------- |
| `/campanas/[slug]/reportar` | Formulario de reporte de fraude (también accesible como modal desde el detalle) |
| `/404`                      | No encontrada (App Router `not-found.tsx`)                                      |
| `/error`                    | Error global (`error.tsx`)                                                      |

**Total estimado del MVP: ~30 rutas.**

---

## 4. Navegación y layouts

### 4.1 Layouts del App Router

```
app/
├── layout.tsx                   # root (ya existe)
├── (public)/layout.tsx          # navbar público + footer
├── (auth)/layout.tsx            # layout centrado para login/registro
├── dashboard/layout.tsx         # navbar autenticado + posible sidebar mínima (backer)
├── creador/layout.tsx           # navbar autenticado + sidebar creador
└── admin/layout.tsx             # navbar autenticado + sidebar admin
```

### 4.2 Navbar público (no autenticado)

- Logo (link a `/`)
- Links: **Explorar**, **Cómo funciona**, **Categorías** (dropdown)
- CTA derecha: **Iniciar campaña** (lleva a registro/login si no auth, sino a `/creador/campanas/nueva`)
- Botones: **Iniciar sesión** / **Registrarse**
- Toggle de tema (claro/oscuro)

### 4.3 Navbar autenticado

- Logo
- Buscador inline (atajo a `/explorar?query=`)
- Campana de **notificaciones** con contador de no leídas (popover con últimas 5 + link a `/dashboard/notificaciones`)
- Dropdown de avatar:
  - Mi perfil
  - **Selector de rol activo** (si el usuario tiene varios roles) — cambia el contexto de navegación
  - Acceso al panel del rol (Dashboard / Panel creador / Panel admin)
  - Toggle de tema
  - Cerrar sesión

### 4.4 Sidebar — Creador (`/creador/*`)

- Resumen (`/creador`)
- Mis campañas (`/creador/campanas`)
- Nueva campaña (`/creador/campanas/nueva`)
- Retiros (`/creador/retiros`)
- Volver al sitio público

### 4.5 Sidebar — Admin (`/admin/*`)

- Resumen (`/admin`)
- Cola de validación (`/admin/validacion`) — con badge de pendientes
- Campañas (`/admin/campanas`)
- Reportes de fraude (`/admin/fraude`) — con badge
- Usuarios (`/admin/usuarios`)

### 4.6 Footer

- Logo + tagline
- Columnas: **Explorar**, **Creadores** (cómo funciona, recursos), **Legal** (términos, privacidad), **Recursos** (links a RSS / exportación CSV — botones stub)
- Copyright

---

## 5. Componentes compartidos clave

| Componente                        | Uso                                                                     |
| --------------------------------- | ----------------------------------------------------------------------- |
| `CampaignCard`                    | Tarjeta usada en grids (landing, explorar, dashboards)                  |
| `CampaignCardSkeleton`            | Loading state de la tarjeta                                             |
| `CampaignProgress`                | Barra de progreso con `raised / goal`, % y backers count                |
| `CountdownTimer`                  | Días/horas restantes; muestra "Finalizada" / "Exitosa" / "No alcanzada" |
| `StatusBadge`                     | Badge de `CampaignStatus` con color por estado                          |
| `CategoryBadge` / `LocationBadge` | Pills informativos                                                      |
| `RewardCard`                      | Tarjeta de recompensa (en detalle y flujo de apoyo)                     |
| `PledgeForm`                      | Formulario de promesa (monto + recompensa opcional + anónimo)           |
| `MoneyDisplay`                    | Formatea centavos → `$XX.XX USD` (única fuente de formato monetario)    |
| `MarkdownRenderer`                | Renderiza descripciones / updates en read-only                          |
| `MarkdownEditor`                  | Editor simple para descripción de campaña y updates                     |
| `Stepper`                         | Indicador de pasos del wizard de creación                               |
| `EmptyState`                      | Mensaje + ilustración para listas vacías                                |
| `ErrorState`                      | Estado de error con botón "Reintentar"                                  |
| `NotificationBell`                | Popover de notificaciones                                               |
| `RoleSwitcher`                    | Cambio de rol activo (solo si multi-rol)                                |
| `ConfirmDialog`                   | Confirmación destructiva (cancelar campaña, eliminar update, etc.)      |
| `FraudReportDialog`               | Modal de reporte de fraude desde el detalle                             |

---

## 6. Flujos críticos

### 6.1 Autenticación + selección de rol

1. Registro: email + password + nombre + rol inicial (`creator` o `backer`).
2. Login mock: valida contra `users.service` y crea `Session` en localStorage.
3. Si el usuario adquiere un segundo rol (ej. un backer crea su primera campaña), el `RoleSwitcher` aparece en el avatar dropdown.
4. Logout limpia la session.

### 6.2 Wizard de creación de campaña (creador)

Pasos (stepper visible):

1. **Información básica** — título, resumen, categoría, ubicación, imagen de portada.
2. **Meta y plazo** — `goalType` (fija / flexible), `goal: Money`, `durationDays` (con fecha de cierre calculada).
3. **Descripción** — markdown enriquecido + galería opcional + video URL opcional.
4. **Recompensas** — agregar N recompensas (mínimo 1 sugerido, no obligatorio si la campaña acepta donación libre).
5. **FAQ** — agregar preguntas/respuestas opcionales.
6. **Revisión y envío** — preview + botón "Enviar a revisión" (cambia status a `pending_review`).

Cada paso valida y permite **guardar borrador** sin enviar. Estado del wizard persiste por `campaignId` en draft.

### 6.3 Flujo de pledge (patrocinador)

1. Desde `/campanas/[slug]` → botón "Apoyar esta campaña".
2. `/campanas/[slug]/apoyar`: elige recompensa o ingresa monto libre.
3. Confirma datos (anónimo sí/no, recibe certificado sí/no).
4. Submit → `pledges.service.create()` → estado `authorized` (mock).
5. Pantalla de éxito + toast + link a "Mis promesas".

UI debe dejar **explícito** el modelo todo-o-nada: "Solo se te cobrará si la campaña alcanza su meta el [fecha]".

### 6.4 Validación de campaña (admin)

1. `/admin/validacion` muestra cola con badge.
2. Click → `/admin/validacion/[id]` con preview completo de cómo se verá la campaña + acciones:
   - **Aprobar** → status `approved` → pasa a `active` al iniciar.
   - **Rechazar** → requiere `rejectionReason`. El creador la ve en su panel y puede editarla y reenviar.
   - **Marcar destacada** (toggle).

### 6.5 Solicitud de retiro (creador)

- Solo disponible para campañas en estado `successful`.
- UI muestra:
  - Total recaudado
  - **Comisión 5%** (calculada y desglosada visualmente)
  - Neto a retirar
  - Si `isNewCreator: true`, **banner de límite diario** con monto usado/disponible hoy.
- Botón "Solicitar retiro" → status `requested`.

### 6.6 Reporte de fraude (patrocinador / público)

- Desde detalle de campaña o `/campanas/[slug]/reportar`.
- Formulario: motivo (select), descripción libre.
- Submit → `fraud.service.report()` → toast de confirmación.
- El backer puede ver sus reportes en `/dashboard/notificaciones` (cuando el admin los resuelve).

### 6.7 Notificación "cerca de la meta"

- Al cargar el dashboard del backer, `campaigns.service.getNearGoal(0.8)` filtra campañas que el usuario apoyó con `raised/goal >= 80%`.
- Aparecen como notificaciones en el centro y posiblemente como toast al login.

---

## 7. Estados de UI obligatorios

Toda vista que consuma servicios debe manejar **explícitamente**:

- **Loading** — skeleton específico (no spinners genéricos).
- **Empty** — `EmptyState` con CTA contextual (ej. "Aún no tienes campañas → Crear la primera").
- **Error** — `ErrorState` con botón reintentar.
- **Validación de formularios** — errores inline por campo + resumen al submit.
- **Éxito** — toast con `sonner` para acciones que no requieren navegación, navegación + flash message para las que sí.

---

## 8. Fuera del alcance del MVP

Se mencionan en la spec pero **no se implementan** en este repo (la UI puede dejar botones/menciones stub):

- Procesamiento real de pagos (Stripe u otro).
- Envío real de emails / blog para actualizaciones.
- Generación de **RSS**, **CSV** y **Google Sheets** (botones de descarga apuntan a `#` o muestran toast "Próximamente").
- Generación real de PDFs para certificados / recibos.
- Algoritmo de campañas destacadas (admin marca manualmente).
- Búsqueda full-text avanzada (solo filtros por categoría, ubicación, ordenamiento).
- Internacionalización (todo el copy en español hardcoded).
- Multi-moneda.
- Comentarios, mensajería directa, compartir en redes sociales.
- Mobile app / PWA / offline.
- Tests automatizados (no hay runner configurado).
- Recuperación de contraseña por email (login simple, sin reset real).
- 2FA.

---

## 9. Definition of Done por feature

Una página/feature se considera **lista para integrar con backend** cuando:

- [ ] Consume la **capa de servicios mock** (no datos hardcoded en el componente).
- [ ] Maneja **loading / empty / error** explícitamente.
- [ ] Es **responsive** (mobile, tablet, desktop) y respeta el theming claro/oscuro.
- [ ] Tiene **roles correctamente protegidos** (lo que requiere `creator` no es accesible para `backer`).
- [ ] Formularios tienen **validación cliente** y mensajes claros.
- [ ] No introduce lógica de negocio que pertenezca al backend (cálculos de comisión y similares son **presentación**, no decisiones).
- [ ] Pasa `pnpm lint` y `pnpm format:check`.
- [ ] Sin `console.log` ni `TODO` sin issue asociado.

---

## 10. Orden de implementación sugerido

Para reducir riesgo y ver progreso temprano:

1. **Fundamentos** — tipos del dominio + capa de servicios mock + seed data + cliente con latencia y localStorage.
2. **Layouts y navegación** — navbar público, navbar autenticado, sidebars, footer.
3. **Auth mock** — login, registro, sesión, protección de rutas por rol.
4. **Catálogo público** — landing, `/explorar` con filtros, detalle de campaña, categorías.
5. **Flujo de pledge** — formulario, confirmación, dashboard del backer (pledges, notificaciones, certificados).
6. **Panel del creador** — dashboard, lista, wizard de creación, edición, updates, FAQs, retiros.
7. **Panel admin** — validación, fraude, campañas, usuarios.
8. **Pulido** — empty states ilustrados, transiciones, copy review, accesibilidad.
