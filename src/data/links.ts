/**
 * Enlaces de /links — la página que reparte tráfico desde tus redes.
 *
 * A diferencia de un Linktree alojado en linktr.ee, aquí el tráfico y
 * los enlaces entrantes se acumulan en TU dominio. Por eso vive en
 * /links y no en un subdominio.
 */
export interface ProfileLink {
  /** Texto visible. Debe ser texto real: Google lo indexa. */
  label: string;
  description?: string;
  url: string;
  /** true → rel="sponsored nofollow", como exige Google en afiliados */
  sponsored?: boolean;
  /** Destaca el botón. Úsalo en uno solo, o deja de destacar. */
  featured?: boolean;
}

export const links: ProfileLink[] = [
  {
    label: 'Contrátame',
    description: 'Desarrollo Flutter · disponible ahora',
    url: '/#contacto',
    featured: true,
  },
  {
    label: 'Mi CV completo',
    description: 'Versión imprimible en PDF',
    url: '/cv',
  },
  {
    label: 'Blog técnico',
    description: 'Flutter, arquitectura offline-first, rendimiento',
    url: '/blog',
  },
  {
    label: 'Apuntes cortos',
    description: 'Trucos de Dart, SQLite y Firebase',
    url: '/tips',
  },
  {
    label: 'GitHub',
    description: 'Código y proyectos propios',
    url: 'https://github.com/JCJMA1994',
  },
  {
    label: 'LinkedIn',
    description: 'Trayectoria y contacto profesional',
    url: 'https://www.linkedin.com/in/jcjma1994/',
  },
];

/** Lista blanca para el endpoint de tracking. */
export const allowedLabels = new Map(links.map((l) => [l.label, l.url]));

export function isInternal(url: string): boolean {
  return url.startsWith('/') || url.startsWith('#');
}

export function relFor(link: ProfileLink): string | undefined {
  if (isInternal(link.url)) return undefined;
  // Tus propios enlaces sin nofollow: transmiten autoridad a tu dominio.
  return link.sponsored ? 'sponsored nofollow noopener' : 'me noopener';
}
