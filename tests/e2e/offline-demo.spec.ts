import { expect, test } from '@playwright/test';

/**
 * El simulador es el argumento de venta de la web. Si se rompe, el
 * visitante no entiende la especialidad. Merece los tests más estrictos.
 */
test.describe('simulador de conectividad', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // client:visible: hay que esperar a que se hidrate.
    await expect(page.getByTestId('cut-network')).toBeVisible();
  });

  test('arranca en línea con la cola vacía', async ({ page }) => {
    await expect(page.getByTestId('net-label')).toHaveText('En línea');
    await expect(page.getByTestId('queue-count')).toHaveText('0');
  });

  test('sin red los pedidos se encolan en local', async ({ page }) => {
    await page.getByTestId('cut-network').click();
    await expect(page.getByTestId('net-label')).toHaveText('Sin conexión');

    await page.getByRole('button', { name: '+ Pedido' }).click();
    await page.getByRole('button', { name: '+ Pedido' }).click();

    await expect(page.getByTestId('queue-count')).toHaveText('2');
    await expect(page.locator('[data-state="queued"]')).toHaveCount(2);
  });

  test('al reconectar la cola se vacía', async ({ page }) => {
    await page.getByTestId('cut-network').click();
    await page.getByRole('button', { name: '+ Pedido' }).click();
    await page.getByRole('button', { name: '+ Pedido' }).click();
    await expect(page.getByTestId('queue-count')).toHaveText('2');

    await page.getByTestId('cut-network').click();
    await expect(page.getByTestId('net-label')).toHaveText('En línea');
    await expect(page.getByTestId('queue-count')).toHaveText('0', { timeout: 6000 });
    await expect(page.locator('[data-state="queued"]')).toHaveCount(0);
  });

  test('estando en línea el pedido se sincroniza solo', async ({ page }) => {
    await page.getByRole('button', { name: '+ Pedido' }).click();
    await expect(page.getByTestId('queue-count')).toHaveText('0', { timeout: 4000 });
  });
});
