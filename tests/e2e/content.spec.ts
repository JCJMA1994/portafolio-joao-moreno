import { expect, test } from '@playwright/test';

test.describe('blog', () => {
  test('el índice lista artículos con enlaces que funcionan', async ({ page }) => {
    await page.goto('/blog');
    const links = page.locator('ol[aria-label="Últimos artículos"] a[href^="/blog/"]');
    expect(await links.count()).toBeGreaterThan(0);

    await links.first().click();
    await expect(page.locator('article h1')).toBeVisible();
  });

  test('muestra un registro destacado y un log numerado', async ({ page }) => {
    await page.goto('/blog');
    await expect(page.locator('[data-featured-post]')).toHaveCount(1);
    const entries = page.locator('[data-post-number]');
    expect(await entries.count()).toBeGreaterThan(0);
    await expect(entries.first()).toHaveText(/^\d{3}$/);
  });

  test('mantiene la navegación visible a 320 px y marca blog en rutas anidadas', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/blog/sincronizar-sqlite-api-rest');
    const blogLink = page.locator('nav[aria-label="Navegación principal"] a[href="/blog"]');
    const navLinks = page.locator('nav[aria-label="Navegación principal"] a');
    for (const link of await navLinks.all()) await expect(link).toBeVisible();
    await expect(blogLink).toHaveAttribute('aria-current', 'page');
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      320,
    );
  });

  test('el índice del artículo enlaza encabezados reales', async ({ page }) => {
    await page.goto('/blog/sincronizar-sqlite-api-rest');
    const links = page.locator('aside[aria-label="Índice del artículo"] a');
    expect(await links.count()).toBeGreaterThan(0);
    for (const link of await links.all()) {
      const href = await link.getAttribute('href');
      expect(href).toMatch(/^#/);
      await expect(page.locator(href ?? '#missing')).toHaveCount(1);
    }
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

  test('tiene un solo título principal y exactamente tres métricas', async ({ page }) => {
    await page.goto('/cv');
    await expect(page.locator('main h1')).toHaveCount(1);
    await expect(page.locator('[data-cv-metric]')).toHaveCount(3);
    await expect(page.locator('.stack-list > li > strong')).toHaveCount(5);
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
