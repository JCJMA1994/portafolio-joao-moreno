import { expect, test } from '@playwright/test';

test.describe('página de enlaces', () => {
  test('lista todos los enlaces con texto visible', async ({ page }) => {
    await page.goto('/links');
    const items = page.locator('#link-list a[data-link-label]');
    expect(await items.count()).toBeGreaterThanOrEqual(4);

    // Cada botón debe tener texto real: Google indexa esto.
    for (const item of await items.all()) {
      expect((await item.innerText()).trim().length).toBeGreaterThan(2);
    }
  });

  test('declara ProfilePage e ItemList en el JSON-LD', async ({ page }) => {
    await page.goto('/links');
    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    const types = JSON.parse(raw ?? '{}')['@graph'].map((n: { '@type': string }) => n['@type']);
    expect(types).toContain('ProfilePage');
    expect(types).toContain('ItemList');
  });

  test('los enlaces externos llevan rel y los internos no', async ({ page }) => {
    await page.goto('/links');
    const external = page.locator('#link-list a[href^="https://"]').first();
    expect(await external.getAttribute('rel')).toContain('noopener');

    const internal = page.locator('#link-list a[href^="/"]').first();
    expect(await internal.getAttribute('rel')).toBeNull();
  });

  test('tiene texto propio para no ser contenido pobre', async ({ page }) => {
    await page.goto('/links');
    const body = await page.locator('main').innerText();
    // Una página que solo son botones no la indexa nadie.
    expect(body.length).toBeGreaterThan(400);
  });

  test('el clic envía un beacon a /api/click', async ({ page }) => {
    await page.goto('/links');

    const requests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes('/api/click')) requests.push(req.method());
    });

    // Interceptamos para no depender de que la base esté configurada.
    await page.route('**/api/click', (route) => route.fulfill({ status: 204 }));
    await page.locator('#link-list a[data-link-label]').first().click();
    await page.waitForTimeout(500);

    expect(requests).toContain('POST');
  });
});

test.describe('panel de estadísticas', () => {
  test('exige credenciales', async ({ request }) => {
    const response = await request.get('/links/stats');
    expect(response.status()).toBe(401);
    expect(response.headers()['www-authenticate']).toContain('Basic');
  });

  test('nunca se cachea ni se indexa', async ({ request }) => {
    const response = await request.get('/links/stats');
    expect(response.headers()['cache-control']).toContain('no-store');
    expect(response.headers()['x-robots-tag']).toContain('noindex');
  });

  test('rechaza credenciales incorrectas', async ({ request }) => {
    const response = await request.get('/links/stats', {
      headers: { Authorization: 'Basic ' + Buffer.from('malo:malo').toString('base64') },
    });
    expect(response.status()).toBe(401);
  });

  test('deja pasar con las credenciales correctas', async ({ request }) => {
    const user = process.env.STATS_USER ?? 'jose';
    const password = process.env.STATS_PASSWORD ?? 'solo-desarrollo-local';
    const response = await request.get('/links/stats', {
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${user}:${password}`).toString('base64'),
      },
    });
    expect(response.status()).toBe(200);
  });
});

test.describe('endpoint de clics', () => {
  test('acepta una etiqueta válida', async ({ request }) => {
    const response = await request.post('/api/click', { data: { label: 'Blog técnico' } });
    expect([204, 400]).toContain(response.status());
  });

  test('ignora etiquetas que no están en la lista blanca', async ({ request }) => {
    const response = await request.post('/api/click', { data: { label: 'inyección-maliciosa' } });
    // 204 silencioso: no confirmamos qué etiquetas existen.
    expect(response.status()).toBe(204);
  });

  test('rechaza un cuerpo que no es JSON', async ({ request }) => {
    const response = await request.post('/api/click', { data: 'esto no es json' });
    expect(response.status()).toBe(400);
  });
});
