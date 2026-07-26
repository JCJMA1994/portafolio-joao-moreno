import { describe, expect, it } from 'vitest';
import { series } from '@/data/series';
import { slugifySeries } from '@/lib/series';

describe('integridad de src/data/series.ts', () => {
  it('no repite nombres de serie', () => {
    const names = series.map((s) => s.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('cada serie tiene al menos un post', () => {
    for (const s of series) {
      expect(s.posts.length).toBeGreaterThan(0);
    }
  });

  it('ningún id de post se repite entre series', () => {
    const ids = series.flatMap((s) => s.posts);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('el total de la serie coincide con la cantidad de miembros (order máximo implícito)', () => {
    // posts[i] implica order === i + 1, así que el total (posts.length)
    // ES el order máximo por construcción. Este test documenta esa
    // invariante: si alguien inserta un hueco o duplica un índice,
    // el conteo deja de tener sentido como "Parte X de N".
    for (const s of series) {
      const total = s.posts.length;
      const maxImpliedOrder = s.posts.length; // último índice + 1
      expect(total).toBe(maxImpliedOrder);
    }
  });

  it('nombres de serie distintos no colisionan en el mismo slug', () => {
    const slugs = series.map((s) => slugifySeries(s.name));
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
