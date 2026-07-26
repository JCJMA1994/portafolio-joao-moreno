import { describe, expect, it } from 'vitest';
import { changelog, featured, archive, parseVersion, compareVersionsDesc } from '@/data/changelog';

describe('parseVersion', () => {
  it('descarta el número de build de pubspec', () => {
    expect(parseVersion('3.0.0+247')).toEqual([3, 0, 0]);
  });

  it('tolera versiones incompletas', () => {
    expect(parseVersion('2.1')).toEqual([2, 1, 0]);
    expect(parseVersion('basura')).toEqual([0, 0, 0]);
  });
});

describe('compareVersionsDesc', () => {
  it('ordena de mayor a menor', () => {
    const versions = ['1.0.0', '3.0.0+247', '2.1.0', '1.1.1'];
    expect(versions.sort(compareVersionsDesc)).toEqual(['3.0.0+247', '2.1.0', '1.1.1', '1.0.0']);
  });

  it('compara minor cuando el major empata', () => {
    expect(compareVersionsDesc('2.5.0', '2.1.0')).toBeLessThan(0);
  });
});

describe('integridad del changelog', () => {
  it('viene ya ordenado de más reciente a más antiguo', () => {
    const versions = changelog.map((e) => e.version);
    const sorted = [...versions].sort(compareVersionsDesc);
    expect(versions).toEqual(sorted);
  });

  it('no repite versiones', () => {
    const versions = changelog.map((e) => e.version);
    expect(new Set(versions).size).toBe(versions.length);
  });

  it('separa destacadas y archivo sin perder ni duplicar entradas', () => {
    expect(featured.length + archive.length).toBe(changelog.length);
  });

  it('solo usa niveles válidos', () => {
    const valid = new Set(['major', 'minor', 'patch']);
    for (const entry of changelog) expect(valid.has(entry.level)).toBe(true);
  });

  it('toda entrada con diff tiene al menos una línea añadida', () => {
    for (const entry of changelog) {
      if (entry.removed) expect(entry.added?.length ?? 0).toBeGreaterThan(0);
    }
  });
});
