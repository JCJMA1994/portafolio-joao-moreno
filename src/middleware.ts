import { defineMiddleware } from 'astro:middleware';
import { STATS_USER, STATS_PASSWORD } from 'astro:env/server';

const PROTECTED = ['/links/stats'];

/**
 * Comparación en tiempo constante.
 *
 * Un `===` normal se corta en el primer carácter distinto, y esa
 * diferencia de tiempo filtra información sobre la contraseña a quien
 * la mida. Comparamos siempre la longitud completa.
 */
function safeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const bufA = encoder.encode(a);
  const bufB = encoder.encode(b);
  const len = Math.max(bufA.length, bufB.length);

  // Empezamos con la diferencia de longitudes ya mezclada, para no
  // delatar cuántos caracteres tiene la contraseña correcta.
  let diff = bufA.length ^ bufB.length;
  for (let i = 0; i < len; i++) {
    diff |= (bufA[i] ?? 0) ^ (bufB[i] ?? 0);
  }
  return diff === 0;
}

function challenge(): Response {
  return new Response('Acceso restringido', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Estadísticas", charset="UTF-8"',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

export const onRequest = defineMiddleware(async (context, next) => {
  // Las páginas prerenderizadas (como /404) no tienen headers de request
  // disponibles: leerlos dispara un warning en build. Como ninguna ruta
  // protegida es estática, salimos temprano y evitamos tocar `request`.
  if (context.isPrerendered) return next();

  const isProtected = PROTECTED.some((path) => context.url.pathname.startsWith(path));
  if (!isProtected) return next();

  // Sin credenciales configuradas, la ruta queda cerrada. Fallar cerrado
  // es la única opción defendible: mejor un 401 molesto que un panel
  // abierto porque olvidaste una variable de entorno en Vercel.
  if (!STATS_USER || !STATS_PASSWORD) return challenge();

  const header = context.request.headers.get('authorization');
  if (!header?.startsWith('Basic ')) return challenge();

  let user = '';
  let password = '';
  try {
    const decoded = atob(header.slice(6));
    const separator = decoded.indexOf(':');
    if (separator === -1) return challenge();
    user = decoded.slice(0, separator);
    password = decoded.slice(separator + 1);
  } catch {
    return challenge();
  }

  // Evaluamos las dos comprobaciones sin cortocircuito con `&&`, para
  // que un usuario incorrecto tarde lo mismo que una contraseña incorrecta.
  const okUser = safeEqual(user, STATS_USER);
  const okPassword = safeEqual(password, STATS_PASSWORD);
  if (!okUser || !okPassword) return challenge();

  const response = await next();
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
});
