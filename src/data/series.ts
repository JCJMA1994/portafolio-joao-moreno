/**
 * Índice de integridad de las series de blog. Mirroring del idioma
 * de `@/data/changelog`: un array tipado, importable directamente,
 * que un test unitario vigila.
 *
 * ROL: esto NO es lo que se renderiza — el render sale del frontmatter
 * vía `getCollection` (ver `src/lib/series.ts`). Este array es la
 * verdad de integridad que el frontmatter DEBE reflejar: mismo nombre,
 * mismos posts, mismo orden. `series-index.test.ts` vigila este array;
 * `astro check` (Zod) vigila el frontmatter. Ambos deben coincidir.
 */
export interface Series {
  /** Nombre humano; debe ser idéntico a frontmatter series.name */
  name: string;
  /** Ids de post en orden ascendente de series.order (1..N) */
  posts: string[];
}

export const series: Series[] = [
  {
    name: 'Offline-first',
    posts: ['sincronizar-sqlite-api-rest', 'cola-sincronizacion-offline'],
  },
  {
    name: 'Perfilar rebuilds',
    posts: ['rebuild-14-fps', 'perfilar-rebuilds-devtools'],
  },
];
