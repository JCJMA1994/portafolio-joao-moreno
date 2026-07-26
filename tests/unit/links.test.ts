import { describe, expect, it } from 'vitest';
import { links, allowedLabels, isInternal, relFor } from '@/data/links';

describe('lista de enlaces', () => {
  it('no tiene etiquetas duplicadas', () => {
    const labels = links.map((l) => l.label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('destaca como máximo un enlace', () => {
    // Si destacas dos, dejas de destacar.
    expect(links.filter((l) => l.featured).length).toBeLessThanOrEqual(1);
  });

  it('las URLs externas son https, nunca http', () => {
    for (const link of links) {
      if (!isInternal(link.url)) expect(link.url).toMatch(/^https:\/\//);
    }
  });

  it('toda etiqueta es texto real indexable, no un icono', () => {
    for (const link of links) expect(link.label.trim().length).toBeGreaterThan(2);
  });
});

describe('lista blanca del endpoint', () => {
  it('contiene exactamente los enlaces declarados', () => {
    expect(allowedLabels.size).toBe(links.length);
    for (const link of links) expect(allowedLabels.get(link.label)).toBe(link.url);
  });

  it('rechaza etiquetas inventadas', () => {
    expect(allowedLabels.has('Etiqueta falsa de un atacante')).toBe(false);
    expect(allowedLabels.has('')).toBe(false);
  });
});

describe('isInternal', () => {
  it('reconoce rutas y anclas propias', () => {
    expect(isInternal('/blog')).toBe(true);
    expect(isInternal('/#contacto')).toBe(true);
    expect(isInternal('#contacto')).toBe(true);
  });

  it('reconoce enlaces externos', () => {
    expect(isInternal('https://github.com/JCJMA1994')).toBe(false);
  });
});

describe('relFor', () => {
  it('no pone rel en los enlaces internos', () => {
    expect(relFor({ label: 'Blog', url: '/blog' })).toBeUndefined();
  });

  it('marca los patrocinados como exige Google', () => {
    const rel = relFor({ label: 'Afiliado', url: 'https://ejemplo.com', sponsored: true });
    expect(rel).toContain('sponsored');
    expect(rel).toContain('nofollow');
  });

  it('usa rel="me" en tus propios perfiles, sin nofollow', () => {
    const rel = relFor({ label: 'GitHub', url: 'https://github.com/JCJMA1994' });
    expect(rel).toContain('me');
    expect(rel).not.toContain('nofollow');
  });

  it('siempre incluye noopener en los externos', () => {
    for (const link of links) {
      if (!isInternal(link.url)) expect(relFor(link)).toContain('noopener');
    }
  });
});
