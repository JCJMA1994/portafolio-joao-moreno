# morenoaleman.dev

Portfolio, blog y CV de **Jose Carlos Moreno Alemán**, desarrollador Flutter.

Astro 7 · React 19 · Tailwind 4 · shadcn/ui · Vitest 4 · Playwright · Vercel

**Modo híbrido:** todo se genera en el build y se sirve desde el CDN, excepto
dos rutas que necesitan servidor (`/api/click` y `/links/stats`). La home, el
blog y `/links` siguen siendo HTML estático.

---

## Puesta en marcha

**Requiere Node 22.12 o superior** (lo exige Astro 7).

```bash
node --version       # debe ser >= 22.12
npm install
npm run dev          # http://localhost:4321
```

Antes del primer despliegue, cambia **una sola línea** en `astro.config.mjs`:

```js
const SITE = 'https://tudominio.com';
```

Sin eso, los canonical, el JSON-LD, el sitemap y el RSS salen con el dominio
de ejemplo. Es el error de configuración que más caro sale en SEO.

## Comandos

| Comando             | Qué hace                               |
| ------------------- | -------------------------------------- |
| `npm run dev`       | Servidor de desarrollo                 |
| `npm run build`     | Comprueba tipos y compila a `dist/`    |
| `npm run preview`   | Sirve el build de producción en local  |
| `npm run typecheck` | `astro check`                          |
| `npm test`          | Tests unitarios (Vitest)               |
| `npm run test:e2e`  | Tests E2E y accesibilidad (Playwright) |
| `npm run format`    | Formatea con Prettier                  |

La primera vez que corras los E2E necesitas los navegadores:

```bash
npx playwright install --with-deps chromium
```

---

## Qué editar y dónde

**Todo lo tuyo vive en dos archivos.** No toques los componentes para cambiar
contenido.

| Quiero cambiar…               | Archivo                  |
| ----------------------------- | ------------------------ |
| Nombre, contacto, bio, stack  | `src/data/profile.ts`    |
| Trayectoria y certificaciones | `src/data/changelog.ts`  |
| Artículos                     | `src/content/blog/*.md`  |
| Apuntes cortos                | `src/content/tips/*.md`  |
| Casos de proyecto             | `src/content/work/*.md`  |
| Paleta y tipografías          | `src/styles/globals.css` |

### Publicar un artículo

Crea `src/content/blog/mi-slug.md`. El nombre del archivo es la URL.

```yaml
---
title: 'Máximo 70 caracteres o Google lo corta'
description: 'Entre 50 y 160 caracteres. Es lo que se lee en el buscador.'
pubDate: 2026-08-01
tags: ['flutter', 'rendimiento']
draft: false
---
```

El esquema está validado con Zod en `src/content.config.ts`: si te olvidas de
la descripción o pones una fecha inválida, **el build falla** en lugar de
publicar una página sin metaetiquetas.

### Publicar un apunte

Igual, en `src/content/tips/`, con un `number` correlativo. Ese número es una
dirección permanente: no lo reutilices ni lo reordenes.

**Regla de contenido:** un apunte por debajo de 300 palabras se lee completo
en `/tips` y **no** recibe URL propia. Al pasar ese umbral, la página se
genera automáticamente en `/tips/[slug]`. Una página con 80 palabras es
contenido pobre y arrastra la autoridad del resto del dominio.

---

## Decisiones de diseño

Están documentadas en los comentarios del código, pero las tres que conviene
no romper sin pensarlo:

**1. Cuatro colores, y el estado se dice con textura.**
Tinta, papel, gris de trama y rojo de sello. Cuando el simulador se queda sin
red, la pantalla se llena de screentone en lugar de cambiar a un quinto color.
Si te ves necesitando otro color, casi siempre la respuesta correcta es una
trama.

**2. El nivel de versión controla el peso tipográfico.**
En `changelog.ts`, un `major` se dibuja grande y un `patch` pequeño. La
jerarquía visual ES la jerarquía semántica. Si pones un `patch` como `major`
para que se vea más, rompes lo único que hace honesto a ese componente.

**3. El rotulador aparece dos veces por página. No más.**
Una en el hero y otra en «Sobre mí». La tercera vez deja de ser un gesto y
pasa a ser decoración.

### El simulador de conectividad

`src/components/OfflineDemo.tsx` es el único componente hidratado de toda la
web, y se carga con `client:visible` para no bloquear el primer pintado.

Existe porque demuestra tu especialidad en lugar de afirmarla: el visitante
corta la red, ve que los pedidos siguen entrando y se sincronizan al
reconectar. Un reclutador lo entiende en cinco segundos sin leer una palabra.

Los iconos de `lucide-react` **no** están hidratados: en Astro, un componente
React sin directiva `client:*` se renderiza a HTML estático en el build. Son
SVG en el HTML final, con cero JavaScript de la librería.

---

## Tests

**40 tests unitarios** sobre el orden semántico del changelog, el cálculo de
tiempo de lectura, el umbral de contenido pobre, la integridad de los datos del
perfil y la lista blanca de enlaces.

**E2E con Playwright** en escritorio y móvil: que el `h1` sea único, que el
JSON-LD declare `Person` y `BlogPosting`, que el tema persista al recargar,
que las etiquetas sean páginas reales con estado 200, que el 404 devuelva 404,
y el flujo completo del simulador (cortar red → encolar → reconectar →
sincronizar).

**Accesibilidad con axe-core** en las cinco plantillas. Cualquier violación
seria o crítica falla el build.

**Lighthouse CI** con presupuesto: rendimiento ≥ 0,95, accesibilidad y SEO en
1,00, LCP < 1,5 s, CLS < 0,05.

El CI de GitHub Actions corre `tipos → formato → unitarios`, y en paralelo
`e2e` y `lighthouse`.

---

## Página de enlaces y analítica

### `/links`

Una página tipo Linktree, pero en **tu** dominio. La diferencia importa: el
tráfico y los enlaces entrantes acumulan autoridad en `morenoaleman.dev` en
lugar de en `linktr.ee`. Edítala en `src/data/links.ts`.

Sigue siendo HTML estático servido desde el CDN (1 KB de JavaScript gzip).
Detalles que no son accidentales:

- Cada botón lleva **texto real**, no solo un icono: Google indexa eso.
- Tus perfiles llevan `rel="me"` sin `nofollow`, para que transmitan
  autoridad. Solo los afiliados llevan `sponsored nofollow`.
- Hay un párrafo propio al final. Una página que solo son botones es
  contenido pobre y Google la ignora.
- `ItemList` y `ProfilePage` en el JSON-LD.

### Analítica de clics

**Es opcional.** Si no configuras la base de datos, `/links` funciona
exactamente igual: simplemente no se registra nada. Eso es deliberado — un
contador de clics no debe poder tumbar tu portafolio.

Para activarla, crea una base gratuita en [Turso](https://turso.tech) y
ejecuta el esquema:

```bash
turso db create morenoaleman
turso db shell morenoaleman < schema.sql
turso db show morenoaleman --url        # → TURSO_DATABASE_URL
turso db tokens create morenoaleman     # → TURSO_AUTH_TOKEN
```

Pon las dos variables en `.env` y en el panel de Vercel.

**Sobre privacidad:** no se guarda IP, ni cookie, ni huella del navegador.
Solo la etiqueta pulsada, el país, el tipo de dispositivo y el dominio de
procedencia. Por eso no necesitas banner de consentimiento bajo el RGPD ni la
Ley 29733 peruana.

El tracking usa `sendBeacon`, que no bloquea ni cancela la navegación: el clic
del visitante siempre tiene prioridad sobre la métrica.

### `/links/stats`

Panel privado con clics totales, evolución de 30 días, ranking por enlace y
desglose por dispositivo, procedencia y país.

El bloque más útil es el de abajo: **los enlaces que nadie ha pulsado nunca**.
Ese dato te dice qué reordenar o borrar.

Protegido con HTTP Basic Auth en `src/middleware.ts`. Tres detalles que sí
importan:

1. **Comparación en tiempo constante.** Un `===` normal se corta en el primer
   carácter distinto, y esa diferencia de microsegundos permite adivinar la
   contraseña carácter a carácter.
2. **Falla cerrado.** Si `STATS_USER` o `STATS_PASSWORD` no están definidas, la
   ruta devuelve 401. Mejor un panel inaccesible que uno abierto porque
   olvidaste una variable en Vercel.
3. **`no-store` y `noindex`** en la respuesta del reto y en la de la página,
   más la exclusión del sitemap y del `robots.txt`.

Limitación honesta: Basic Auth no tiene logout. Se cierra la sesión cerrando el
navegador.

---

## Notas sobre Astro 7

El proyecto está en la última versión (Astro 7, junio de 2026). Tres cosas
que conviene saber si vienes de versiones anteriores o tocas el código:

**1. El compilador es Rust y ya no perdona HTML inválido.** No auto-corrige
anidamientos incorrectos ni etiquetas sin cerrar: da error de build. Si añades
un `<div>` dentro de un `<p>`, lo vas a saber enseguida.

**2. `compressHTML` es `'jsx'` por defecto**, así que el espacio en blanco
entre expresiones separadas por un salto de línea desaparece, igual que en
React. Esto muerde de verdad: `© {year}\n{profile.name}` renderiza
«© 2026Jose Carlos». Por eso el copyright de `Footer.astro` se compone en el
frontmatter — así es inmune a que Prettier reformatee la plantilla. Hay tres
tests E2E en `home.spec.ts` que detectan esta clase de regresión, porque es
invisible en el código y solo se nota leyendo la página.

**3. Markdown lo procesa Sätteri**, no remark/rehype. Si algún día necesitas
un plugin de remark o rehype, instala `@astrojs/markdown-remark` y añade
`markdown: { processor: unified() }` a la config.

El resaltado de código sigue siendo Shiki, configurado con
`theme: 'css-variables'` para que los colores salgan de la paleta en
`globals.css` en lugar del tema oscuro por defecto, que rompería la
disciplina de cuatro colores.

**Sobre `@astrojs/db`:** se eliminó del ecosistema en Astro 7. La analítica de
clics usa `@libsql/client` contra Turso, que es la alternativa que recomienda
la propia documentación de Astro.

---

## Despliegue en Vercel

```bash
git init && git add -A && git commit -m "feat: portfolio inicial"
gh repo create morenoaleman-dev --private --source=. --push
```

Luego importa el repo en Vercel. Detecta Astro solo; `vercel.json` ya trae las
cabeceras de seguridad y el cacheado inmutable de los assets. Cada rama genera
una preview y `main` va a producción.

---

## Pendiente antes de publicar

Por orden de impacto:

- [ ] **Cambiar `SITE`** en `astro.config.mjs` por tu dominio.
- [ ] **Capturas de las apps.** Ahora hay marcos con trama. Ponlas en
      `src/assets/` y úsalas con `astro:assets` para que se generen en WebP.
- [ ] **Nombres reales y cifras de los proyectos.** En `src/content/work/`
      están los marcadores `[X]s`, `[N]`. Sin números, esa sección es la más
      débil de la web. Si hay NDA, sirve «app de gestión de campo para ~5.000
      usuarios».
- [ ] **Imagen OG** en `public/og-default.png`, a 1200×630.
- [ ] **Base de Turso** si quieres la analítica de `/links` (opcional).
- [ ] **`STATS_USER` y `STATS_PASSWORD`** en Vercel, o `/links/stats` queda
      cerrado del todo.
- [ ] **Foto de retrato** en «Sobre mí», o quitar el bloque. Ambas valen.
- [ ] **Rellenar los rompehielos** en `profile.ts`. Son las tres líneas más
      humanas de la web y ahora tienen texto de relleno.
- [ ] **Una cita** de un lead o compañero, con nombre y cargo.
- [ ] **Terminar los tres artículos.** Están esbozados con tu voz pero les
      falta tu experiencia real.
- [ ] Autoalojar las fuentes con `@fontsource` para eliminar la petición a
      Google Fonts (mejora el LCP y evita el aviso de privacidad).
- [ ] OG dinámicas por artículo con Satori, si quieres que cada entrada tenga
      su propia tarjeta al compartirse.

### Sobre el hueco de dic 2024 a jun 2025

El formato changelog hace los huecos más visibles que un CV normal: es un
efecto secundario de la decisión de diseño. Tienes dos opciones honestas:
dejarlo (nadie pregunta por seis meses) o añadir una entrada `[2.2.0]` con lo
que hiciste —cursos, proyectos propios, freelance—. Lo segundo es mejor si de
verdad hubo algo.

---

## Licencia

El código es tuyo. Las tipografías son de Google Fonts (OFL).

---

## Tracking de enlaces (`/links` y `/links/stats`)

`/links` es la página tipo Linktree que pones en la bio de Instagram o
LinkedIn. Es **estática**, así que se sirve desde el CDN igual que el resto.
El tracking se hace desde el navegador contra `/api/click`.

### Por qué no hay cookies

Solo se guardan agregados anónimos: etiqueta pulsada, país, tipo de
dispositivo y dominio de procedencia. **Sin IP, sin cookies, sin
identificador de usuario.** Por eso no necesitas banner de consentimiento.

El clic se envía con `sendBeacon`, que no bloquea ni cancela la navegación:
el visitante navega inmediatamente y la métrica viaja en paralelo. Si la base
de datos falla, el visitante no se entera.

### Configurarlo (opcional, 5 minutos)

Sin configurar, el sitio funciona perfectamente: solo se pierden las cifras.

Usamos [Turso](https://turso.tech), que es SQLite alojado. Guiño intencionado:
es la misma base de datos que usas para la persistencia offline en Flutter.

```bash
# 1. Crear la base
turso db create morenoaleman

# 2. Crear la tabla
turso db shell morenoaleman < schema.sql

# 3. Conseguir las credenciales
turso db show morenoaleman --url
turso db tokens create morenoaleman
```

Copia `.env.example` a `.env` y rellena los cuatro valores. Súbelos también a
Vercel en _Settings → Environment Variables_.

```bash
cp .env.example .env
```

### Ver las estadísticas

`https://tudominio.com/links/stats`, protegido con HTTP Basic Auth. El
navegador te pedirá `STATS_USER` y `STATS_PASSWORD`.

Muestra totales, evolución de 30 días, ranking por enlace con porcentaje, y
desglose de dispositivo y procedencia. El bloque más útil está abajo: **los
enlaces que nadie ha pulsado**. Ese dato te dice qué reordenar o borrar.

Dos limitaciones honestas: Basic Auth no tiene botón de cerrar sesión (se
cierra al cerrar el navegador), y si faltan las variables de entorno la ruta
devuelve 401 en lugar de abrirse. Eso último es deliberado.

### Qué cambió en el despliegue

El proyecto pasó de estático puro a **híbrido**. La home, el blog, los
apuntes, el CV y `/links` siguen siendo HTML generado en build. Solo dos
rutas se ejecutan en el servidor:

| Ruta           | Modo     | Por qué                        |
| -------------- | -------- | ------------------------------ |
| `/api/click`   | servidor | escribe en la base de datos    |
| `/links/stats` | servidor | lee datos en vivo + Basic Auth |

Requiere el adaptador `@astrojs/vercel`, ya configurado. El LCP de la home no
cambia: sigue siendo un archivo estático desde el CDN.

---

## Nota sobre versiones

El proyecto está en **Astro 5**, que es estable y es la versión con la que
verifiqué los 35 tests y el build. Existe Astro 7, pero migrar implica
revisar las colecciones de contenido y el adaptador. Si quieres actualizar más
adelante, hazlo en una rama aparte y deja que el CI te diga qué se rompe.
