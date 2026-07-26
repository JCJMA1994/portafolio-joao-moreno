import { describe, expect, it } from 'vitest';
import {
  readingTime,
  wordCount,
  deservesOwnPage,
  formatDate,
  isoDate,
  THIN_CONTENT_THRESHOLD,
  cn,
} from '@/lib/utils';

describe('wordCount', () => {
  it('cuenta palabras separadas por cualquier espacio', () => {
    expect(wordCount('uno dos tres')).toBe(3);
    expect(wordCount('uno\n\ndos   tres\ttres')).toBe(4);
  });

  it('no cuenta cadenas vacías ni espacios sueltos', () => {
    expect(wordCount('')).toBe(0);
    expect(wordCount('    ')).toBe(0);
  });
});

describe('readingTime', () => {
  it('nunca devuelve menos de un minuto', () => {
    expect(readingTime('tres palabras aquí')).toBe(1);
    expect(readingTime('')).toBe(1);
  });

  it('calcula a 200 palabras por minuto', () => {
    expect(readingTime('palabra '.repeat(400))).toBe(2);
    expect(readingTime('palabra '.repeat(1000))).toBe(5);
  });
});

describe('deservesOwnPage', () => {
  it('rechaza los apuntes por debajo del umbral', () => {
    expect(deservesOwnPage('palabra '.repeat(THIN_CONTENT_THRESHOLD - 1))).toBe(false);
  });

  it('acepta exactamente en el umbral', () => {
    expect(deservesOwnPage('palabra '.repeat(THIN_CONTENT_THRESHOLD))).toBe(true);
  });
});

describe('formatDate', () => {
  it('formatea en español sin desplazar el día por zona horaria', () => {
    // Sin timeZone:'UTC' esta fecha se mostraría como 13 de julio en Lima.
    expect(formatDate(new Date('2026-07-14T00:00:00Z'))).toContain('14');
    expect(formatDate(new Date('2026-07-14T00:00:00Z'))).toContain('julio');
  });
});

describe('isoDate', () => {
  it('devuelve solo la parte de fecha', () => {
    expect(isoDate(new Date('2026-07-14T18:30:00Z'))).toBe('2026-07-14');
  });
});

describe('cn', () => {
  it('resuelve conflictos de Tailwind quedándose con la última clase', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('descarta valores falsos', () => {
    expect(cn('base', false && 'no', undefined, 'extra')).toBe('base extra');
  });
});
