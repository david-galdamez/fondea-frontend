# Tarea: Subida de imágenes de portada de campaña (Cloudinary)

> Tipo: Feature (frontend, con una posible dependencia menor de backend)
> Área: Wizard de creación/edición de campañas
> Prioridad: Media-Alta (bloquea que las campañas tengan imagen real)
> Estimación orientativa: 0.5–1 día

---

## 1. Contexto

Hoy, la imagen de portada de una campaña se captura como **una URL escrita a mano**:
el usuario tiene que pegar un enlace a una imagen ya hospedada en algún lado. No existe
ninguna forma de **subir un archivo** desde el equipo del usuario — ni en el frontend ni en
el backend (no hay upload, multipart ni almacenamiento).

Queremos que el creador pueda **elegir/subir una imagen desde su dispositivo** y que esa
imagen quede asociada a la campaña, sin montar infraestructura de almacenamiento propia.

La estrategia acordada es usar **Cloudinary**: el archivo se sube desde el navegador a
Cloudinary, que devuelve una **URL pública**, y esa URL es la que ya viaja al backend en el
campo `coverImageUrl` que **ya existe** en el contrato. Es decir, el backend no necesita
saber nada de Cloudinary: sigue recibiendo y guardando un `String` con la URL.

---

## 2. Qué se busca lograr (objetivo)

En el wizard de campaña, el creador debe poder **subir una imagen de portada desde su
equipo** mediante un botón. Tras subirla:

- Se muestra una **vista previa** de la imagen seleccionada.
- La URL pública resultante queda guardada en el estado del wizard y se **envía al backend**
  como `coverImageUrl` al crear/editar la campaña.
- La imagen se ve correctamente en las vistas que ya la renderizan (tarjeta, detalle, panel
  de validación del admin).

El usuario **ya no debería tener que pegar una URL a mano** (ese input se reemplaza por la
subida). Opcionalmente se puede permitir "pegar URL" como alternativa, pero no es requisito.

---

## 3. Dónde se trabaja (mapa de archivos)

### Frontend — `~/Workspace/fondea-frontend`
- `src/components/creator/wizard/step-basics.tsx`
  Aquí está hoy el input "URL de imagen de portada". Es el lugar donde irá el botón de
  subida + la vista previa.
- `src/components/creator/wizard/types.ts`
  La interfaz `WizardFields` **NO tiene** el campo `coverImageUrl` actualmente. Hay que
  añadirlo (y a su valor inicial donde se inicialicen los fields del wizard).
- `src/components/creator/wizard/campaign-wizard.tsx`
  La función `buildRequest()` (~línea 134) **NO incluye `coverImageUrl`** en el payload que
  se manda al backend. Hay que cablearlo (ver §5, punto 1 — bug a corregir sí o sí).
- `src/lib/api/campaigns.service.ts`
  El tipo `RegisterCampaignRequest` **ya define `coverImageUrl: string`** y `create()/update()`
  ya lo enviarían — no requiere cambios de contrato, solo que el payload lo incluya.
- Vistas que ya consumen la portada (verificar que siguen funcionando, no rehacer):
  `src/components/campaigns/campaign-card.tsx`, `src/components/campaigns/campaign-detail.tsx`,
  `src/components/admin/validation-detail.tsx`.
- Entorno: `.env.local` (local) y documentar la nueva variable en `.env.example`.

### Backend — `~/Workspace/fondea-backend`
- **No se toca para subir la portada.** El contrato (`RegisterCampaignRequest.coverImageUrl`,
  `CampaignSummaryDto.coverImageUrl`) ya soporta la URL.
- ⚠️ **Dependencia a confirmar:** `CampaignDetailDto` **no incluye `coverImageUrl`** hoy. Si
  la vista de **detalle** de campaña debe mostrar la portada, se necesita un cambio pequeño
  en el backend (agregar `coverImageUrl` al `CampaignDetailDto` y a su mapper). Coordinar con
  backend; documentarlo aunque no lo implementes tú.

---

## 4. Qué debe obtener / preparar (cuenta y configuración)

El dev deberá conseguir y dejar documentado:

1. **Cuenta de Cloudinary** (free tier es suficiente para el MVP). Coordinar con el equipo si
   se usa una cuenta compartida del proyecto en lugar de una personal.
2. **Cloud name** de la cuenta (lo necesita el frontend).
3. Un **upload preset de tipo *unsigned*** creado en el panel de Cloudinary
   (Settings → Upload), configurado con restricciones razonables:
   - Carpeta destino (p. ej. `fondea/campaigns`).
   - Formatos permitidos (jpg, png, webp).
   - Tamaño/dimensiones máximas.
4. **Variable de entorno** en el frontend (p. ej. `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`) en
   `.env.local`, y su entrada (sin valor) en `.env.example`.
5. Decidir e instalar la dependencia de cliente adecuada (investigar la opción oficial para
   Next.js; ver §6).

> Nota de seguridad: el preset *unsigned* es el camino rápido para el MVP, pero permite que
> cualquiera con el nombre del preset suba a la cuenta. Mitigarlo con las restricciones del
> preset. Si el equipo exige más control, evaluar el modo *signed* (requiere un endpoint que
> firme la subida, en un route handler de Next o en el backend) — documentar la decisión.

---

## 5. Criterios de aceptación

1. ✅ **Bug corregido:** al crear/editar una campaña, `coverImageUrl` viaja en el payload de
   `POST /api/campaigns` (y `PUT`), y se persiste. Hoy no se envía. Esto debe quedar resuelto
   aunque sea con la subida nueva.
2. ✅ El creador puede **subir una imagen desde su equipo** en el paso "Información" del
   wizard y ver una **vista previa** antes de continuar.
3. ✅ Tras guardar la campaña, la portada se muestra correctamente en la **tarjeta** del
   catálogo y en el **panel de validación** del admin.
4. ✅ Manejo de errores: si la subida falla, se informa al usuario (toast) y no se rompe el
   wizard.
5. ✅ La variable de entorno está documentada en `.env.example`; no se commitea ningún secreto.
6. ✅ `pnpm lint`, formato Prettier y `tsc` limpios para los archivos tocados (respetar
   convenciones del repo: sin punto y coma, comillas simples, 2 espacios, copy de UI en
   español, identificadores en inglés).
7. 🟡 (Si aplica) Si se requiere portada en la **vista de detalle**, queda abierta/coordinada
   la dependencia de backend (`coverImageUrl` en `CampaignDetailDto`).

---

## 6. Pistas / puntos de partida (sin solución cerrada)

- Investigar el componente de subida oficial para Next.js de Cloudinary (`next-cloudinary`,
  componente tipo *upload widget*). Documentación: https://next.cloudinary.dev
- El objeto de resultado de una subida exitosa expone una URL pública (campo `secure_url`):
  esa es la que hay que guardar en `coverImageUrl`.
- Aprovechar que Cloudinary puede **optimizar/redimensionar** la entrega (entregar la imagen
  ya en el tamaño de la tarjeta) — opcional pero recomendable para rendimiento.
- Decidir si el botón de subida reemplaza por completo el input de URL o convive con él.

---

## 7. Fuera de alcance

- **Galería** (`gallery[]`) y **video** (`videoUrl`): el wizard tiene inputs para ellos, pero
  el backend **no los soporta** (no existen en el modelo ni en los DTOs) y ya están comentados
  en `step-review.tsx`. No forman parte de esta tarea; son una decisión aparte (quitarlos del
  frontend o agregarlos al backend).
- Migrar otros consumidores de imágenes o limpiar el campo legacy `imageUrl` del modelo
  `Campaign` en el backend (duplicado de `coverImageUrl`).
- Modo *signed* de Cloudinary (solo evaluarlo/documentarlo si el equipo lo pide).

---

## 8. Definición de "Hecho"

Rama `feature/...` partiendo de `develop`, PR a `develop` con: subida funcionando end-to-end
(subir → preview → guardar → ver portada en tarjeta/admin), `coverImageUrl` persistido,
variable documentada en `.env.example`, checks de lint/formato/tipos limpios en lo tocado, y
la dependencia de backend (detalle) anotada en el PR si resultó necesaria.
