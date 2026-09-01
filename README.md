# morenoaleman.dev

Portfolio, blog y CV de **Jose Carlos Moreno Alemán**, desarrollador Flutter.

Astro 7 · React 19 · Tailwind 4 · shadcn/ui · Vitest 4 · Playwright · Turso · Vercel

**Modo híbrido:** todo se genera en el build y se sirve como HTML estático desde el CDN, excepto dos rutas bajo demanda (`/api/click` y `/links/stats`). La home, el blog, los apuntes, el CV y `/links` son 100% estáticos.

---

## Puesta en marcha

**Requiere Node 22.12 o superior** (exigido por Astro 7).

```bash
node --version       # debe ser >= 22.12
npm install
npm run dev          # http://localhost:4321
```

Antes del despliegue en producción, valida la URL en `astro.config.mjs`:

```js
const SITE = 'https://portafolio.system-failed-tech.com';
```

Sin esto, las etiquetas canonical, el JSON-LD, el sitemap y el feed RSS se generarán con dominios incorrectos.

---

## Comandos

| Comando               | Qué hace                                                         |
| --------------------- | ---------------------------------------------------------------- |
| `npm run dev`         | Servidor de desarrollo local                                     |
| `npm run build`       | Chequeo de tipos (`astro check`) y compilación a `dist/`         |
| `npm run preview`     | Servidor local para previsualizar el build de producción         |
| `npm run typecheck`   | Validación estricta de tipos de TypeScript y Astro               |
| `npm test`            | Suite completa de tests unitarios (Vitest)                       |
| `npm run test:watch`  | Vitest en modo interactivo/watch                                 |
| `npm run test:e2e`    | Tests End-to-End y accesibilidad con Playwright                  |
| `npm run test:e2e:ui` | Interfaz interactiva de Playwright                               |
| `npm run cv:pdf`      | Compila el sitio y exporta el CV a PDF (`scripts/export-cv.mjs`) |
| `npm run lint`        | Verificación de formato y sintaxis con Prettier                  |
| `npm run format`      | Formatea automáticamente el código con Prettier                  |

Para ejecutar los tests E2E por primera vez, instala los navegadores de Playwright:

```bash
npx playwright install --with-deps chromium
```

> **Nota para E2E:** Los tests de Playwright se ejecutan contra el **build de producción**. Ejecuta siempre `npm run build` antes de correr `npm run test:e2e`.

---

## Arquitectura de datos: Qué editar y dónde

El proyecto aplica el principio de **Single Source of Truth** (fuente única de verdad). El contenido no se modifica tocando plantillas o componentes JSX/Astro.

| Quiero cambiar…                  | Archivo fuente           |
| -------------------------------- | ------------------------ |
| Identidad, contacto, bio, stack  | `src/data/profile.ts`    |
| Trayectoria y empresas canónicas | `src/data/changelog.ts`  |
| Proyección y logros del CV       | `src/data/cv.ts`         |
| Enlaces de la página `/links`    | `src/data/links.ts`      |
| Integridad de series del blog    | `src/data/series.ts`     |
| Artículos técnicos               | `src/content/blog/*.md`  |
| Apuntes cortos (tips)            | `src/content/tips/*.md`  |
| Casos de estudio de proyectos    | `src/content/work/*.md`  |
| Tokens de diseño y paleta        | `src/styles/globals.css` |

### Publicar un artículo

Crea un archivo Markdown en `src/content/blog/mi-slug.md`. El nombre del archivo define su URL canónica.

```yaml
---
title: 'Máximo 70 caracteres para evitar truncado en Google'
description: 'Entre 50 y 160 caracteres. Texto visible en SERP y tarjetas OG.'
pubDate: 2026-08-01
tags: ['flutter', 'rendimiento', 'offline']
level: 'intermedio' # principiante | intermedio | avanzado
draft: false
# Opcional (si pertenece a una serie):
series:
  name: 'Offline-first'
  order: 3
---
```

El esquema está validado con Zod en `src/content/blog-schema.ts`. Si faltan campos obligatorios o la fecha es inválida, **el build falla automáticamente**.

### Publicar un apunte (Tip)

Crea `src/content/tips/053-mi-apunte.md` con un `number` correlativo permanente.

> **Regla de contenido (Thin-Content Threshold):**
> Un apunte con menos de 300 palabras (`THIN_CONTENT_THRESHOLD`) se renderiza completo en la vista general de `/tips` y **no** genera una URL propia `/tips/[slug]`. Al superar las 300 palabras, Astro genera su página dedicada. Esto previene penalizaciones por contenido pobre en motores de búsqueda.

---

## Decisiones de diseño y arquitectura

1. **Disciplina de 4 colores y texturas de manga impreso:**
   Tinta (`--color-ink`), papel (`--color-paper`), tono de trama (`--color-tone`) y señal/rojo (`--color-signal`/`--color-red`). Los estados y transiciones se comunican con patrones de trama (_screentone_), evitando la proliferación desordenada de colores.

2. **Jerarquía visual alineada a SemVer:**
   En el `Changelog`, una versión `major` refleja cambios de empresa/rol con mayor peso tipográfico; un `minor` capacidades técnicas; y un `patch` certificaciones. La jerarquía visual equivale a la semántica real.

3. **Uso selectivo de elementos de énfasis:**
   El subrayado de rotulador (_highlighter_) está limitado a dos apariciones clave por página (Hero y Sobre mí) para mantener su impacto comunicativo.

4. **Simulador Offline interactivo (`OfflineDemo.tsx`):**
   Es el **único** componente React hidratado (`client:visible`) en toda la aplicación. Permite al reclutador desconectar la red virtualmente, comprobar cómo se encolan las transacciones en SQLite local y ver la reconciliación automática al reconectar. Los iconos de `lucide-react` y componentes estáticos se compilan a puro HTML sin runtime de React en el cliente.

---

## Suite de Pruebas y Control de Calidad

- **Tests unitarios (Vitest):** Más de 80 tests distribuidos en 10 suites (`tests/unit/`) que validan la integridad del perfil, esquemas de blog, cálculo de tiempo de lectura, lógica de navegación de series, exportación de CV y lista blanca de enlaces.
- **Tests End-to-End (Playwright):** Cobertura multiplataforma (Desktop Chromium y Pixel 7) sobre la persistencia de tema claro/oscuro, singularidad del tag `h1`, tipado JSON-LD (`Person`, `ProfilePage`, `BlogPosting`), estados HTTP 200/404 y flujo completo del simulador offline.
- **Accesibilidad automatizada (`@axe-core/playwright`):** Auditoría estricta contra violaciones de accesibilidad en Home, Blog, Artículos, Series, Tips y CV.
- **Lighthouse CI:** Presupuesto de calidad estricto: Rendimiento ≥ 0.95, Accesibilidad = 1.0, SEO = 1.0, LCP < 1.5s, CLS < 0.05.

---

## Tracking de enlaces y analítica con privacidad (`/links` y `/links/stats`)

### `/links`

Página de enlaces personalizada alojada en tu propio dominio para acumular autoridad SEO (PageRank) en lugar de cederla a servicios de terceros.

- Enlaces propios configurados con `rel="me"` (sin `nofollow`).
- Enlaces de afiliados marcados automáticamente como `rel="sponsored nofollow"`.
- Marcado estructurado Schema.org (`ItemList` y `ProfilePage`).

### Analítica de clics (Opcional con Turso)

La analítica está desacoplada del frontend principal mediante un diseño resiliente: si la base de datos no está configurada o se cae, el sitio web continúa funcionando sin interrupciones.

- **Sin cookies ni almacenamiento de IP:** Recopila únicamente agregados anónimos (etiqueta del enlace, país, tipo de dispositivo, referrer). Cumple por diseño con RGPD y Ley 29733 (Perú) sin requerir banners invasivos de cookies.
- **Transmisión no bloqueante:** Emplea `navigator.sendBeacon` para garantizar que la navegación del usuario nunca se degrade por registrar la métrica.

#### Configuración de base de datos (Turso):

```bash
# 1. Crear la base de datos
turso db create morenoaleman

# 2. Aplicar el esquema SQL
turso db shell morenoaleman < schema.sql

# 3. Obtener credenciales
turso db show morenoaleman --url        # -> TURSO_DATABASE_URL
turso db tokens create morenoaleman     # -> TURSO_AUTH_TOKEN
```

Configura `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` en tu archivo `.env` y en Vercel.

### Panel privado (`/links/stats`)

Ruta SSR protegida con HTTP Basic Auth (`STATS_USER` y `STATS_PASSWORD`):

- Comparación en tiempo constante (`safeEqual`) para mitigar ataques de temporización (_timing attacks_).
- Política de fallo cerrado (_fail-closed_): Si las variables de entorno no están presentes, devuelve 401 automáticamente.
- Cabeceras estrictas `no-store` y `noindex` con exclusión explícita en `sitemap.xml` y `robots.txt`.

---

## Aspectos técnicos de Astro 7

- **Compilador en Rust:** Exige HTML estrictamente válido. Etiquetas mal anidadas o sin cerrar producen errores en tiempo de compilación.
- **Compresión HTML (`compressHTML: 'jsx'`):** Elimina espacios en blanco entre expresiones multilínea. Las concatenaciones de texto (como derechos de autor en el footer) se formatean en el frontmatter para prevenir inconsistencias de renderizado.
- **Motor Markdown Sätteri:** Procesamiento de Markdown nativo y de alto rendimiento. El resaltado Shiki utiliza `theme: 'css-variables'` delegando la paleta a `globals.css`.
- **Conectividad a base de datos:** Reemplazo de `@astrojs/db` por `@libsql/client` para interactuar con Turso en entornos serverless.

---

## Despliegue en Vercel

```bash
git init && git add -A && git commit -m "feat: portfolio inicial"
gh repo create morenoaleman-dev --private --source=. --push
```

Al conectar el repositorio con Vercel, el proyecto se autoconfigura mediante `@astrojs/vercel` y `vercel.json` (que incluye cabeceras de seguridad CSP/HSTS y caché inmutable para assets estáticos).

---

## Lista de verificación antes de publicar

- [ ] **Configurar dominio:** Actualizar la constante `SITE` en `astro.config.mjs`.
- [ ] **Capturas de proyectos:** Ubicar imágenes reales en `src/assets/` y consumirlas mediante `astro:assets` (formato WebP optimizado).
- [ ] **Completar métricas de proyectos:** Sustituir marcadores en `src/content/work/*.md` con cifras e impacto demostrable.
- [ ] **Generar imagen Open Graph:** Diseñar `public/og-default.png` (1200x630 px).
- [ ] **Credenciales de analítica:** Definir `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, `STATS_USER` y `STATS_PASSWORD` en Vercel.
- [ ] **Personalizar rompehielos:** Rellenar la sección `icebreakers` en `src/data/profile.ts`.
- [ ] **Finalizar borradores:** Publicar los artículos técnicos pendientes en `src/content/blog/`.
- [ ] **Autoalojar fuentes:** Migrar fuentes a paquetes `@fontsource` para optimizar LCP y privacidad.

---

## Licencia

Código bajo licencia MIT / Propietario de Jose Carlos Moreno Alemán. Tipografías bajo Open Font License (OFL).
