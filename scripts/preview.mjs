import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, resolve } from 'node:path';

const host = '127.0.0.1';
const port = Number.parseInt(process.env.PORT || '4321', 10);
const root = resolve('dist/client');

const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.xml': 'application/xml; charset=utf-8',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

const allowedLabels = new Set([
  'Contrátame',
  'Mi CV completo',
  'Blog técnico',
  'Apuntes cortos',
  'GitHub',
  'LinkedIn',
]);

const server = createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${host}:${port}`);
  const pathname = decodeURIComponent(url.pathname);

  // SSR Endpoint: /api/click
  if (pathname === '/api/click' && req.method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 512) {
        res.writeHead(413).end();
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        const parsed = JSON.parse(body);
        if (typeof parsed !== 'object' || parsed === null) {
          res.writeHead(400).end();
          return;
        }
        if (typeof parsed.label === 'string' && !allowedLabels.has(parsed.label)) {
          res.writeHead(204).end();
          return;
        }
        res.writeHead(204).end();
      } catch {
        res.writeHead(400).end();
      }
    });
    return;
  }

  // SSR Route: /links/stats
  if (pathname === '/links/stats' || pathname === '/links/stats/') {
    const authHeader = req.headers['authorization'];
    const validUser = process.env.STATS_USER || 'jose';
    const validPass = process.env.STATS_PASSWORD || 'solo-desarrollo-local';
    const expectedAuth = 'Basic ' + Buffer.from(`${validUser}:${validPass}`).toString('base64');

    if (!authHeader || authHeader !== expectedAuth) {
      res.writeHead(401, {
        'WWW-Authenticate': 'Basic realm="Estadísticas", charset="UTF-8"',
        'Cache-Control': 'no-store',
        'X-Robots-Tag': 'noindex, nofollow',
        'Content-Type': 'text/plain; charset=utf-8',
      });
      res.end('Acceso restringido');
      return;
    }

    res.writeHead(200, {
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex, nofollow',
      'Content-Type': 'text/html; charset=utf-8',
    });
    res.end('<!doctype html><html><body><h1>Panel de Estadísticas</h1></body></html>');
    return;
  }

  // Static files in dist/client
  let filePath = join(root, pathname);
  try {
    let stats = await stat(filePath);
    if (stats.isDirectory()) {
      filePath = join(filePath, 'index.html');
      stats = await stat(filePath);
    }
    const ext = extname(filePath);
    const contentType = types[ext] || 'application/octet-stream';
    const content = await readFile(filePath);
    res.writeHead(200, { 'Content-Type': contentType }).end(content);
  } catch {
    try {
      const notFoundPath = join(root, '404.html');
      const notFoundContent = await readFile(notFoundPath);
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }).end(notFoundContent);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 Not Found');
    }
  }
});

server.listen(port, host, () => {
  console.log(`[preview] Sirviendo dist/client en http://${host}:${port}`);
});
