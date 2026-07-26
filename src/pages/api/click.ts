import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { allowedLabels } from '@/data/links';

// Este endpoint sí necesita servidor, aunque /links sea estático.
export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let label: unknown;
  try {
    label = JSON.parse(await request.text())?.label;
  } catch {
    return new Response(null, { status: 400 });
  }

  // Lista blanca. Sin esto, cualquiera infla tu tabla con un bucle de
  // curl y tus estadísticas dejan de significar nada.
  // Respondemos 204 en lugar de 403: no confirmamos qué etiquetas existen.
  if (typeof label !== 'string' || !allowedLabels.has(label)) {
    return new Response(null, { status: 204 });
  }

  const db = getDb();
  // Sin base configurada no registramos, pero tampoco fallamos: el clic
  // del visitante ya está navegando y no debe verse afectado.
  if (!db) return new Response(null, { status: 204 });

  const ua = request.headers.get('user-agent') ?? '';
  // Bots y prefetch inflan las cifras sin ser personas.
  if (/bot|crawler|spider|preview|headless|prerender/i.test(ua)) {
    return new Response(null, { status: 204 });
  }

  // Referrer reducido al dominio: no guardamos rutas de terceros.
  let referrer: string | null = null;
  const ref = request.headers.get('referer');
  if (ref) {
    try {
      const url = new URL(ref);
      referrer = url.hostname === new URL(request.url).hostname ? 'directo' : url.hostname;
    } catch {
      referrer = null;
    }
  }

  try {
    await db.execute({
      sql: `INSERT INTO click (label, target, referrer, country, device)
            VALUES (?, ?, ?, ?, ?)`,
      args: [
        label,
        allowedLabels.get(label)!,
        referrer,
        request.headers.get('x-vercel-ip-country') ?? request.headers.get('cf-ipcountry') ?? null,
        /mobile|android|iphone|ipad/i.test(ua) ? 'móvil' : 'escritorio',
      ],
    });
  } catch (error) {
    // Un fallo de la analítica no debe convertirse en un error visible.
    console.error('[click] no se pudo registrar:', error);
  }

  // sendBeacon no lee la respuesta.
  return new Response(null, { status: 204 });
};
