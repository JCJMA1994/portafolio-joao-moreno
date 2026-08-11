import { describe, expect, it } from 'vitest';
import { blogSchema } from '@/content/blog-schema';

const base = {
  title: 'Un artículo de prueba',
  description: 'Descripción de al menos cincuenta caracteres para pasar la validación del esquema.',
  pubDate: new Date('2026-01-01'),
  tags: ['flutter'],
  number: 1,
  featured: false,
};

describe('blogSchema', () => {
  it('parsea un post válido con level', () => {
    const result = blogSchema.safeParse({ ...base, level: 'intermedio' });
    expect(result.success).toBe(true);
  });

  it('rechaza un post sin level', () => {
    const result = blogSchema.safeParse({ ...base });
    expect(result.success).toBe(false);
  });

  it('rechaza un level fuera del enum', () => {
    const result = blogSchema.safeParse({ ...base, level: 'experto' });
    expect(result.success).toBe(false);
  });

  it('requiere un número permanente positivo', () => {
    const missing = { ...base, level: 'intermedio' } as Record<string, unknown>;
    delete missing.number;
    expect(blogSchema.safeParse(missing).success).toBe(false);
    expect(blogSchema.safeParse({ ...base, number: 0, level: 'intermedio' }).success).toBe(false);
  });

  it('requiere declarar si el artículo es destacado', () => {
    const missing = { ...base, level: 'intermedio' } as Record<string, unknown>;
    delete missing.featured;
    expect(blogSchema.safeParse(missing).success).toBe(false);
  });

  it('rechaza series sin order', () => {
    const result = blogSchema.safeParse({
      ...base,
      level: 'intermedio',
      series: { name: 'Offline-first' },
    });
    expect(result.success).toBe(false);
  });

  it('parsea un post standalone sin series', () => {
    const result = blogSchema.safeParse({ ...base, level: 'principiante' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.series).toBeUndefined();
    }
  });

  it('parsea un post de serie con order positivo', () => {
    const result = blogSchema.safeParse({
      ...base,
      level: 'avanzado',
      series: { name: 'Offline-first', order: 1 },
    });
    expect(result.success).toBe(true);
  });
});
