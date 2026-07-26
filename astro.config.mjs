import { defineConfig, envField } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

// Cambia esto por tu dominio real antes del primer deploy.
// Sin `site`, los canonical y el JSON-LD salen con URLs relativas.
const SITE = 'https://morenoaleman.dev';

export default defineConfig({
  site: SITE,

  // Híbrido: todo se genera en el build EXCEPTO las rutas que declaran
  // `prerender = false` (/api/click y /links/stats). La home, el blog y
  // /links siguen siendo HTML estático servido desde el CDN.
  output: 'static',
  adapter: vercel(),

  integrations: [
    react(),
    mdx(),
    sitemap({
      // /cv y las estadísticas no deben aparecer en el sitemap.
      filter: (page) => !page.includes('/cv') && !page.includes('/links/stats'),
      i18n: { defaultLocale: 'es', locales: { es: 'es-PE' } },
    }),
  ],

  env: {
    schema: {
      // Credenciales del panel /links/stats. Si faltan, el middleware
      // deja la ruta cerrada: fallar cerrado es la única opción segura.
      STATS_USER: envField.string({ context: 'server', access: 'secret', optional: true }),
      STATS_PASSWORD: envField.string({ context: 'server', access: 'secret', optional: true }),

      // Base de datos de la analítica de clics. Opcionales a propósito:
      // sin ellas el sitio funciona igual, solo se pierde la métrica.
      // Un contador de clics no debe poder tumbar tu portafolio.
      TURSO_DATABASE_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      TURSO_AUTH_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },

  markdown: {
    // Astro 7 usa Sätteri como procesador de Markdown. El resaltado sigue
    // siendo Shiki, y por defecto trae 'github-dark', que mete un fondo
    // #24292e y colores que rompen la paleta de cuatro tonos.
    // 'css-variables' delega el color a globals.css.
    shikiConfig: { theme: 'css-variables', wrap: false },
  },

  vite: { plugins: [tailwindcss()] },
  image: { responsiveStyles: true },
  build: { inlineStylesheets: 'auto' },
  prefetch: { prefetchAll: true, defaultStrategy: 'viewport' },
});
