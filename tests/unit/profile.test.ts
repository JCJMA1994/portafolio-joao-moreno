import { describe, expect, it } from 'vitest';
import { profile, socials, stack, skillGroups } from '@/data/profile';

describe('perfil', () => {
  it('tiene una descripción SEO dentro del rango que Google muestra', () => {
    expect(profile.seoDescription.length).toBeGreaterThanOrEqual(50);
    expect(profile.seoDescription.length).toBeLessThanOrEqual(300);
  });

  it('tiene un email con forma válida', () => {
    expect(profile.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  });

  it('tiene el teléfono en formato E.164 para el enlace tel:', () => {
    expect(profile.phone).toMatch(/^\+\d{6,15}$/);
  });
});

describe('redes sociales', () => {
  it('todas las URLs son absolutas y https', () => {
    for (const social of socials) expect(social.url).toMatch(/^https:\/\//);
  });

  it('no hay etiquetas duplicadas', () => {
    const labels = socials.map((s) => s.label);
    expect(new Set(labels).size).toBe(labels.length);
  });
});

describe('árbol del stack', () => {
  it('empieza en la raíz con indentación cero', () => {
    expect(stack[0]?.indent).toBe(0);
    expect(stack[0]?.root).toBe(true);
  });

  it('nunca salta más de un nivel de indentación de golpe', () => {
    for (let i = 1; i < stack.length; i++) {
      const jump = (stack[i]?.indent ?? 0) - (stack[i - 1]?.indent ?? 0);
      expect(jump).toBeLessThanOrEqual(1);
    }
  });

  it('cada nodo explica por qué está ahí', () => {
    for (const node of stack) expect(node.why.length).toBeGreaterThan(10);
  });
});

describe('grupos de habilidades', () => {
  it('no hay grupos vacíos', () => {
    for (const group of skillGroups) expect(group.items.length).toBeGreaterThan(0);
  });
});
