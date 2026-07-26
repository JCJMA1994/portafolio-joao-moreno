/**
 * Lógica de series, aislada de astro:content: opera sobre la forma
 * mínima que necesita (`id` + `data.series` opcional), superconjunto
 * compatible con `CollectionEntry<'blog'>`. Esto permite testearla
 * con fixtures planos en vitest y reutilizarla desde `[slug].astro`
 * y `series/[series].astro` sin duplicar la regla de orden/slug.
 */

export interface SeriesInfo {
  name: string;
  order: number;
}

export interface WithOptionalSeries {
  id: string;
  data: {
    series?: SeriesInfo;
  };
}

export interface SeriesNav<T extends WithOptionalSeries> {
  name: string;
  slug: string;
  index: number;
  total: number;
  prev?: T;
  next?: T;
}

/**
 * "Offline-first" → "offline-first". NFD + quitar diacríticos primero
 * para que "Depuración" no se convierta en "depuraci-n".
 */
export function slugifySeries(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function uniqueSeriesNames<T extends WithOptionalSeries>(posts: T[]): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const post of posts) {
    const name = post.data.series?.name;
    if (name && !seen.has(name)) {
      seen.add(name);
      names.push(name);
    }
  }
  return names;
}

export function getSeriesPosts<T extends WithOptionalSeries>(posts: T[], name: string): T[] {
  return posts
    .filter((post) => post.data.series?.name === name)
    .sort((a, b) => (a.data.series?.order ?? 0) - (b.data.series?.order ?? 0));
}

export function getSeriesNav<T extends WithOptionalSeries>(
  posts: T[],
  postId: string,
): SeriesNav<T> | null {
  const post = posts.find((p) => p.id === postId);
  const series = post?.data.series;
  if (!post || !series) return null;

  const ordered = getSeriesPosts(posts, series.name);
  const index = ordered.findIndex((p) => p.id === postId);

  return {
    name: series.name,
    slug: slugifySeries(series.name),
    index: index + 1,
    total: ordered.length,
    prev: index > 0 ? ordered[index - 1] : undefined,
    next: index < ordered.length - 1 ? ordered[index + 1] : undefined,
  };
}
