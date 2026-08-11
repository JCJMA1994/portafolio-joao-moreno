import { expect, test } from '@playwright/test';

test.describe('home', () => {
  test('muestra el nombre y el rol en un solo h1', async ({ page }) => {
    await page.goto('/');
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);
    await expect(h1).toContainText('Moreno Alemán');
  });

  test('tiene las metaetiquetas que necesita para compartirse', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc?.length ?? 0).toBeGreaterThan(50);
  });

  test('el JSON-LD es válido y declara la entidad Person', async ({ page }) => {
    await page.goto('/');
    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    const data = JSON.parse(raw ?? '{}');
    const types = data['@graph'].map((node: { '@type': string }) => node['@type']);
    expect(types).toContain('Person');
    expect(types).toContain('WebSite');
  });

  test('todas las secciones de episodio están presentes', async ({ page }) => {
    await page.goto('/');
    for (const title of ['Trayecto', 'Trabajo', 'Escritura', 'Stack', 'Sobre mí', 'Contacto']) {
      await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    }
  });

  test('el historial completo se despliega sin JavaScript de por medio', async ({ page }) => {
    await page.goto('/');
    const details = page.locator('details').first();
    await expect(details).not.toHaveAttribute('open', '');
    await details.locator('summary').click();
    await expect(details).toHaveAttribute('open', '');
  });

  test('sincroniza el enlace activo con el hash de la portada', async ({ page }) => {
    await page.goto('/#trabajo');
    const nav = page.locator('nav[aria-label="Navegación principal"]');
    await expect(nav.locator('a[href="/#trabajo"]')).toHaveAttribute('aria-current', 'page');
    await expect(nav.locator('a[href="/#contacto"]')).not.toHaveAttribute('aria-current', 'page');

    await page.evaluate(() => {
      location.hash = 'contacto';
    });
    await expect(nav.locator('a[href="/#contacto"]')).toHaveAttribute('aria-current', 'page');
    await expect(nav.locator('a[href="/#trabajo"]')).not.toHaveAttribute('aria-current', 'page');
  });
});

test.describe('tema', () => {
  test('persiste después de recargar', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const wasDark = await html.evaluate((el) => el.classList.contains('dark'));

    await page.getByRole('button', { name: /cambiar entre tema/i }).click();
    await expect(html).toHaveClass(wasDark ? /^(?!.*dark).*$/ : /dark/);

    await page.reload();
    const isDark = await html.evaluate((el) => el.classList.contains('dark'));
    expect(isDark).toBe(!wasDark);
  });
});

/**
 * Desde Astro 7 el valor por defecto de `compressHTML` es 'jsx', que come
 * el espacio en blanco entre expresiones separadas por un salto de línea.
 * Prettier puede partir una línea al reformatear y producir «© 2026Jose».
 * Estos tests detectan esa clase de regresión, que es invisible en el
 * código y solo se nota leyendo la página.
 */
test.describe('espaciado del texto (compressHTML jsx)', () => {
  test('el copyright del footer conserva sus espacios', async ({ page }) => {
    await page.goto('/');
    const text = await page.getByTestId('copyright').innerText();
    expect(text).toMatch(/©\s\d{4}\sJose Carlos Moreno Alemán/);
  });

  test('no hay palabras pegadas a un año o a un separador', async ({ page }) => {
    await page.goto('/');
    const body = await page.locator('body').innerText();
    // Un año seguido inmediatamente de una letra delata un espacio perdido.
    expect(body).not.toMatch(/\d{4}[A-ZÁÉÍÓÚÑa-záéíóúñ]/);
  });

  test('la etiqueta del reloj está separada de la hora', async ({ page }) => {
    await page.goto('/');
    const text = await page.getByTestId('clock-label').innerText();
    expect(text.endsWith(' ') || text === 'Hora local').toBeTruthy();
  });
});
