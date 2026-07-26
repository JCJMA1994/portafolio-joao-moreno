import { createClient, type Client } from '@libsql/client';
import { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN } from 'astro:env/server';

/**
 * Cliente de Turso (SQLite alojado) creado de forma perezosa.
 *
 * Devuelve null si faltan las credenciales, en lugar de lanzar. Así el
 * sitio funciona igual sin analítica configurada: se pierde la métrica,
 * no la página. Un contador de clics no debería poder tumbar tu web.
 */
let client: Client | null | undefined;

export function getDb(): Client | null {
  if (client !== undefined) return client;

  if (!TURSO_DATABASE_URL || !TURSO_AUTH_TOKEN) {
    client = null;
    return null;
  }

  client = createClient({
    url: TURSO_DATABASE_URL,
    authToken: TURSO_AUTH_TOKEN,
  });
  return client;
}

export const isTrackingEnabled = () => getDb() !== null;
