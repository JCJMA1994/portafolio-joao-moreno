import { expect, test } from '@playwright/test';

test.describe('blog', () => {
  test('el índice lista artículos con enlaces que funcionan', async ({ page }) => {
    await page.goto('/blog');
    const links = page.locator('main ul a[href^="/blog/"]');
    expect(await links.count()).toBeGreaterThan(0);

    await links.first().click();
    await expect(page.locator('article h1')).toBeVisible();
  });

  test('el artículo declara BlogPosting y breadcrumbs', async ({ page }) => {
    await page.goto('/blog/sincronizar-sqlite-api-rest');
    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    const types = JSON.parse(raw ?? '{}')['@graph'].map((n: { '@type': string }) => n['@type']);
    expect(types).toContain('BlogPosting');
    expect(types).toContain('BreadcrumbList');
  });

  test('las etiquetas son páginas reales indexables', async ({ page }) => {
    const response = await page.goto('/blog/tag/flutter');
    expect(response?.status()).toBe(200);
    await expect(page.locator('main a[href^="/blog/"]').first()).toBeVisible();
  });

  test('el RSS se sirve como XML con entradas', async ({ request }) => {
    const response = await request.get('/rss.xml');
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('<rss');
    expect(body).toContain('<item>');
  });
});

test.describe('apuntes', () => {
  test('los apuntes cortos se leen completos sin URL propia', async ({ page }) => {
    await page.goto('/tips');
    const articles = page.locator('main article');
    expect(await articles.count()).toBeGreaterThan(0);
    // El cuerpo está en la propia página, no detrás de un enlace.
    await expect(articles.first().locator('.prose-manga')).not.toBeEmpty();
  });
});

test.describe('cv', () => {
  test('está fuera del índice de búsqueda', async ({ page }) => {
    await page.goto('/cv');
    const robots = await page.locator('meta[name="robots"]').getAttribute('content');
    expect(robots).toContain('noindex');
  });

  test('no muestra el screentone de fondo', async ({ page }) => {
    await page.goto('/cv');
    await expect(page.locator('.tone-overlay')).toHaveCount(0);
  });
});

test.describe('404', () => {
  test('responde con estado 404 de verdad', async ({ page }) => {
    const response = await page.goto('/esta-ruta-no-existe-jamas');
    expect(response?.status()).toBe(404);
  });
});
