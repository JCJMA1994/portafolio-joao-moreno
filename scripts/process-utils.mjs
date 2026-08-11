import { spawn } from 'node:child_process';

export const DEFAULT_CHILD_TIMEOUT_MS = 60_000;
export const DEFAULT_TERMINATION_GRACE_MS = 1_000;

export const shouldRetryInterpreter = (error) => error?.code === 'ENOENT';

/** @typedef {[executable: string, args: string[]]} PythonCandidate */
/**
 * @typedef {object} ProcessLike
 * @property {number | null} exitCode
 * @property {NodeJS.Signals | null} signalCode
 * @property {(signal: NodeJS.Signals) => boolean} kill
 * @property {(event: string, listener: (...args: any[]) => void) => unknown} once
 */
/**
 * @typedef {object} RunChildOptions
 * @property {string} [cwd]
 * @property {import('node:child_process').StdioOptions} [stdio]
 * @property {number} [timeoutMs]
 * @property {AbortSignal} [signal]
 * @property {(child: ProcessLike) => void} [onSpawn]
 * @property {(child: ProcessLike) => void | Promise<void>} [onSettled]
 * @property {(executable: string, args: string[], options: {cwd: string, stdio: import('node:child_process').StdioOptions}) => ProcessLike} [spawnImpl]
 * @property {number} [terminationGraceMs]
 */

/** @returns {PythonCandidate[]} */
export function pythonCandidates(env = process.env, platform = process.platform) {
  return [
    ...(env.CV_PYTHON ? [[env.CV_PYTHON, []]] : []),
    ...(platform === 'win32'
      ? [
          ['python', []],
          ['py', ['-3']],
        ]
      : [
          ['python3', []],
          ['python', []],
        ]),
  ];
}

/**
 * @param {string} executable
 * @param {string[]} args
 * @param {RunChildOptions} [options]
 */
export function runChild(
  executable,
  args,
  {
    cwd = process.cwd(),
    stdio = 'inherit',
    timeoutMs = DEFAULT_CHILD_TIMEOUT_MS,
    signal,
    onSpawn,
    onSettled,
    spawnImpl = spawn,
    terminationGraceMs = DEFAULT_TERMINATION_GRACE_MS,
  } = {},
) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawnImpl(executable, args, { cwd, stdio });
    let settled = false;
    let terminationError;
    let forceKillTimer;

    const finish = async (callback, value) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      clearTimeout(forceKillTimer);
      signal?.removeEventListener('abort', onAbort);
      try {
        await onSettled?.(child);
      } catch (error) {
        rejectRun(error);
        return;
      }
      callback(value);
    };
    const isRunning = () => child.exitCode === null && child.signalCode === null;
    const requestTermination = (error) => {
      if (settled || terminationError) return;
      terminationError = error;
      clearTimeout(timer);
      if (isRunning()) child.kill('SIGTERM');
      forceKillTimer = setTimeout(() => {
        if (isRunning()) child.kill('SIGKILL');
      }, terminationGraceMs);
    };
    const onAbort = () => {
      const error = new Error('Proceso cancelado', { cause: signal?.reason });
      error.code = 'CHILD_ABORTED';
      requestTermination(error);
    };
    const timer = setTimeout(() => {
      const error = new Error(`${executable} excedió el límite de ${timeoutMs} ms`);
      error.code = 'CHILD_TIMEOUT';
      requestTermination(error);
    }, timeoutMs);

    onSpawn?.(child);
    signal?.addEventListener('abort', onAbort, { once: true });
    if (signal?.aborted) onAbort();
    child.once('error', (error) => {
      if (signal?.aborted) {
        const aborted = new Error('Proceso cancelado', { cause: signal.reason ?? error });
        aborted.code = 'CHILD_ABORTED';
        void finish(rejectRun, aborted);
        return;
      }
      void finish(rejectRun, error);
    });
    child.once('exit', (code, exitSignal) => {
      if (terminationError) void finish(rejectRun, terminationError);
      else if (code === 0) void finish(resolveRun);
      else
        void finish(
          rejectRun,
          new Error(`${executable} terminó con ${exitSignal ?? `código ${code}`}`),
        );
    });
  });
}
