import { spawnSync } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import {
  pythonCandidates,
  runChild,
  shouldRetryInterpreter,
} from '../../scripts/process-utils.mjs';

const candidates = pythonCandidates();

const python = candidates.find(
  ([executable, args]) =>
    spawnSync(executable, [...args, '-c', 'import reportlab, pypdf'], {
      stdio: 'ignore',
    }).status === 0,
);

describe('exportador de CV', () => {
  it('prioriza el intérprete configurado mediante CV_PYTHON', () => {
    expect(pythonCandidates({ CV_PYTHON: '/runtime/python' }, 'linux')[0]).toEqual([
      '/runtime/python',
      [],
    ]);
  });

  it('solo reintenta cuando el intérprete no existe', () => {
    expect(shouldRetryInterpreter({ code: 'ENOENT' })).toBe(true);
    expect(shouldRetryInterpreter({ code: 'CHILD_TIMEOUT' })).toBe(false);
    expect(shouldRetryInterpreter({ code: 'CHILD_ABORTED' })).toBe(false);
    expect(shouldRetryInterpreter(new Error('Falló la validación'))).toBe(false);
  });

  it('termina un proceso hijo que excede el timeout', async () => {
    await expect(
      runChild(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
        stdio: 'ignore',
        timeoutMs: 50,
      }),
    ).rejects.toMatchObject({ code: 'CHILD_TIMEOUT' });
  });

  it('termina un proceso hijo cuando se cancela la exportación', async () => {
    const controller = new AbortController();
    const running = runChild(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], {
      stdio: 'ignore',
      signal: controller.signal,
    });
    controller.abort();
    await expect(running).rejects.toMatchObject({ code: 'CHILD_ABORTED' });
  });

  it('espera exit y escala a SIGKILL cuando el hijo ignora SIGTERM', async () => {
    vi.useFakeTimers();
    const signals: NodeJS.Signals[] = [];
    const child = new EventEmitter() as EventEmitter & {
      exitCode: number | null;
      signalCode: NodeJS.Signals | null;
      kill: (signal: NodeJS.Signals) => boolean;
    };
    Object.assign(child, {
      exitCode: null as number | null,
      signalCode: null as NodeJS.Signals | null,
      kill(signal: NodeJS.Signals) {
        signals.push(signal);
        if (signal === 'SIGKILL') {
          child.signalCode = signal;
          queueMicrotask(() => child.emit('exit', null, signal));
        }
        return true;
      },
    });
    let tracked = true;
    let releaseCleanup!: () => void;
    const cleanupGate = new Promise<void>((resolveCleanup) => {
      releaseCleanup = resolveCleanup;
    });

    try {
      const running = runChild('fake-python', [], {
        stdio: 'ignore',
        timeoutMs: 5,
        terminationGraceMs: 10,
        spawnImpl: () => child,
        onSettled: async () => {
          tracked = false;
          await cleanupGate;
        },
      });
      const rejected = expect(running).rejects.toMatchObject({ code: 'CHILD_TIMEOUT' });
      let completed = false;
      void running
        .finally(() => {
          completed = true;
        })
        .catch(() => undefined);

      await vi.advanceTimersByTimeAsync(5);
      expect(signals).toEqual(['SIGTERM']);
      expect(tracked).toBe(true);
      await vi.advanceTimersByTimeAsync(10);
      expect(completed).toBe(false);
      releaseCleanup();
      await rejected;
      expect(signals).toEqual(['SIGTERM', 'SIGKILL']);
      expect(tracked).toBe(false);
      expect(completed).toBe(true);
    } finally {
      vi.useRealTimers();
    }
  });

  it.skipIf(!python)('ejecuta el contrato de validación sin Chromium', () => {
    const [executable, args] = python!;
    const result = spawnSync(
      executable,
      [...args, 'scripts/export_cv_reportlab.py', '--self-test'],
      { encoding: 'utf8' },
    );

    expect(result.status, result.stderr).toBe(0);
  });

  it.skipIf(!python)('acepta un temporal administrado y lo limpia al terminar', () => {
    const [executable, args] = python!;
    const temporary = resolve('output/pdf', `.cv-contract.${randomUUID()}.tmp.pdf`);
    const result = spawnSync(
      executable,
      [...args, 'scripts/export_cv_reportlab.py', '--self-test', '--temporary', temporary],
      { encoding: 'utf8' },
    );

    expect(result.status, result.stderr).toBe(0);
    expect(existsSync(temporary)).toBe(false);
  });
});
