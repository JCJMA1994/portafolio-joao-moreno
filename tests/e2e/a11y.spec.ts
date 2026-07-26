import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * Accesibilidad en las cuatro plantillas. Falla el build si aparece
 * cualquier violación serie o crítica: es más barato arreglarlo aquí
 * que después de que alguien no pueda usar la web.
 */
const pages = [
  { path: '/', name: 'home' },
  { path: '/blog', name: 'índice de blog' },
  { path: '/blog/sincronizar-sqlite-api-rest', name: 'artículo' },
  { path: '/blog/series/offline-first', name: 'serie de blog' },
  { path: '/tips', name: 'apuntes' },
  { path: '/cv', name: 'cv' },
];

for (const { path, name } of pages) {
  test(`${name} no tiene violaciones de accesibilidad`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const serious = results.violations.filter((v) =>
      ['serious', 'critical'].includes(v.impact ?? ''),
    );
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([]);
  });
}

test('el enlace de salto al contenido funciona con teclado', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const focused = page.locator(':focus');
  await expect(focused).toHaveAttribute('href', '#main');
});

test('el foco es visible en los enlaces de navegación', async ({ page }) => {
  await page.goto('/');
  const link = page.locator('nav a').first();
  await link.focus();
  const outline = await link.evaluate((el) => getComputedStyle(el).outlineWidth);
  expect(outline).not.toBe('0px');
});

/**
 * La insignia de nivel es la única excepción a la paleta de cuatro
 * colores (ver LevelBadge.astro): verificamos sus tres tonos contra
 * axe en ambos esquemas de color, no solo confiar en el escaneo
 * general de página.
 */
for (const scheme of ['light', 'dark'] as const) {
  test(`las insignias de nivel pasan contraste de color en modo ${scheme}`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await page.goto('/blog');
    const results = await new AxeBuilder({ page })
      .include('[aria-label^="Nivel:"]')
      .withTags(['wcag2aa'])
      .analyze();

    const contrastViolations = results.violations.filter((v) => v.id === 'color-contrast');
    expect(contrastViolations, JSON.stringify(contrastViolations, null, 2)).toEqual([]);
  });
}
