import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, rm, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { chromium } from '@playwright/test';
import {
  DEFAULT_CHILD_TIMEOUT_MS,
  pythonCandidates,
  runChild,
  shouldRetryInterpreter,
} from './process-utils.mjs';

const host = '127.0.0.1';
const port = 4321;
const root = resolve('dist/client');
const url = `http://${host}:${port}/cv`;
const outputDir = resolve('output/pdf');
const output = join(outputDir, 'CV_Jose_Carlos_Moreno_Flutter-2026.pdf');
const temporary = join(outputDir, `.CV_Jose_Carlos_Moreno_Flutter-2026.${process.pid}.tmp.pdf`);
const pythonTemporary = join(outputDir, `.CV_Jose_Carlos_Moreno_Flutter-2026.${randomUUID()}.reportlab.tmp.pdf`);
const fallbackOnly = process.argv.includes('--fallback-only');
const types = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

const childTimeoutMs = Number.parseInt(
  process.env.CV_EXPORT_TIMEOUT_MS ?? String(DEFAULT_CHILD_TIMEOUT_MS),
  10,
);
if (!Number.isFinite(childTimeoutMs) || childTimeoutMs <= 0) {
  throw new Error('CV_EXPORT_TIMEOUT_MS debe ser un entero positivo');
}
const candidates = pythonCandidates();
const interruption = new AbortController();
let activeChild;
let browser;
let server;
let cleanupPromise;

await mkdir(outputDir, { recursive: true });

async function validateBasic(path) {
  const info = await stat(path);
  if (info.size < 1_000) throw new Error(`PDF incompleto: ${info.size} bytes`);
  const bytes = await readFile(path);
  if (!bytes.subarray(0, 5).equals(Buffer.from('%PDF-'))) throw new Error('Firma PDF inválida');
  if (!bytes.subarray(-1_024).includes(Buffer.from('%%EOF')))
    throw new Error('PDF sin marcador EOF');
}

async function runPython(args, { optional = false } = {}) {
  let unavailable = true;
  let lastError;
  for (const [executable, prefix] of candidates) {
    try {
      await runChild(executable, [...prefix, 'scripts/export_cv_reportlab.py', ...args], {
        timeoutMs: childTimeoutMs,
        signal: interruption.signal,
        onSpawn: (child) => {
          activeChild = child;
        },
        onSettled: async (child) => {
          if (activeChild === child) activeChild = undefined;
          await rm(pythonTemporary, { force: true });
        },
      });
      return true;
    } catch (error) {
      lastError = error;
      if (!shouldRetryInterpreter(error)) throw error;
    }
  }
  if (optional && unavailable) return false;
  throw lastError ?? new Error('Python no está disponible para exportar el CV');
}

async function fallback(reason) {
  if (reason)
    process.stderr.write(
      `Playwright no pudo exportar el CV; usando ReportLab: ${reason.message}\n`,
    );
  await runPython(['--temporary', pythonTemporary]);
  await validateBasic(output);
  process.stdout.write(`${output}\n`);
}

function createStaticServer() {
  return createServer(async (request, response) => {
    try {
      const pathname = new URL(request.url ?? '/', url).pathname;
      const relative = pathname.endsWith('/') ? `${pathname}index.html` : pathname;
      const requested = normalize(join(root, relative));
      if (requested !== root && !requested.startsWith(`${root}${sep}`)) {
        throw new Error('Ruta no permitida');
      }

      let file = requested;
      if (!extname(file)) file = join(file, 'index.html');
      const body = await readFile(file);
      response.writeHead(200, {
        'content-type': types[extname(file)] ?? 'application/octet-stream',
      });
      response.end(body);
    } catch {
      response.writeHead(404).end('Not found');
    }
  });
}

async function listen(server) {
  await new Promise((resolveListen, rejectListen) => {
    server.once('error', rejectListen);
    server.listen(port, host, resolveListen);
  });
}

async function close(server) {
  if (!server.listening) return;
  await new Promise((resolveClose) => server.close(resolveClose));
}

async function cleanupResources() {
  if (cleanupPromise) return cleanupPromise;
  cleanupPromise = (async () => {
    const currentBrowser = browser;
    browser = undefined;
    await currentBrowser?.close().catch(() => undefined);
    const currentServer = server;
    server = undefined;
    if (currentServer) await close(currentServer);
    await rm(temporary, { force: true });
    if (!activeChild) await rm(pythonTemporary, { force: true });
  })().finally(() => {
    cleanupPromise = undefined;
  });
  return cleanupPromise;
}

function interrupt(signal) {
  process.exitCode = signal === 'SIGINT' ? 130 : 143;
  interruption.abort(
    Object.assign(new Error(`Exportación interrumpida por ${signal}`), { code: 'CHILD_ABORTED' }),
  );
  void cleanupResources().catch(() => undefined);
}

process.once('SIGINT', () => interrupt('SIGINT'));
process.once('SIGTERM', () => interrupt('SIGTERM'));

if (fallbackOnly) {
  try {
    await fallback();
  } finally {
    await cleanupResources();
  }
} else {
  server = createStaticServer();
  try {
    await listen(server);
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    if (!response?.ok())
      throw new Error(`La ruta /cv respondió ${response?.status() ?? 'sin estado'}`);
    await page.emulateMedia({ media: 'print', colorScheme: 'light' });
    await page.pdf({
      path: temporary,
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: '10mm', right: '14mm', bottom: '10mm', left: '14mm' },
    });
    await validateBasic(temporary);
    await runPython(['--validate-only', temporary], { optional: true });
    await rename(temporary, output);
    process.stdout.write(`${output}\n`);
  } catch (error) {
    if (
      interruption.signal.aborted ||
      error?.code === 'CHILD_ABORTED' ||
      error?.code === 'CHILD_TIMEOUT'
    )
      throw error;
    await cleanupResources();
    await fallback(error);
  } finally {
    await cleanupResources();
  }
}
