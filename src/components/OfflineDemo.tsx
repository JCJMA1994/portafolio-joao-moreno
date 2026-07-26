import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Simulador de conectividad — el elemento signature de la web.
 *
 * En vez de afirmar «hago apps offline-first», deja que el visitante
 * corte la red y lo compruebe: los pedidos siguen entrándose, se
 * acumulan en la cola local y se sincronizan al reconectar.
 *
 * Es el único componente de todo el sitio hidratado con JavaScript,
 * y se carga con client:visible para no bloquear el primer pintado.
 */

type State = 'synced' | 'queued' | 'syncing';

interface Order {
  id: number;
  state: State;
}

const LABEL: Record<State, string> = {
  synced: 'sincronizado',
  queued: 'en cola',
  syncing: 'enviando',
};

const INITIAL: Order[] = [
  { id: 1042, state: 'synced' },
  { id: 1041, state: 'synced' },
];

const VISIBLE_ROWS = 4;

export default function OfflineDemo() {
  const [online, setOnline] = useState(true);
  const [orders, setOrders] = useState<Order[]>(INITIAL);
  const [note, setNote] = useState('SQLite guarda en local. La cola se vacía al reconectar.');
  const [boom, setBoom] = useState(false);

  const nextId = useRef(1043);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const calm = useRef(false);

  useEffect(() => {
    calm.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Limpiar los temporizadores al desmontar evita actualizar estado
    // de un componente que ya no existe.
    return () => timers.current.forEach(clearTimeout);
  }, []);

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(setTimeout(fn, ms));
  }, []);

  const patch = useCallback((id: number, state: State) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, state } : o)));
  }, []);

  const addOrder = useCallback(() => {
    const id = nextId.current++;
    setOrders((prev) => [{ id, state: online ? 'syncing' : 'queued' }, ...prev]);

    if (online) {
      setNote('Escrito en SQLite y enviado al servidor.');
      later(() => patch(id, 'synced'), 600);
    } else {
      setNote('Sin red: guardado en local y encolado.');
    }
  }, [online, later, patch]);

  const toggleNetwork = useCallback(() => {
    if (online) {
      setOnline(false);
      setNote('Modo avión. La app sigue operativa.');
      if (!calm.current) {
        setBoom(false);
        later(() => setBoom(true), 20);
        later(() => setBoom(false), 950);
      }
      return;
    }

    setOnline(true);
    const queued = orders.filter((o) => o.state === 'queued').reverse();

    if (queued.length === 0) {
      setNote('Reconectado. Nada pendiente.');
      return;
    }

    setNote('Reconectado. Vaciando la cola…');
    queued.forEach((order, i) => {
      later(() => {
        patch(order.id, 'syncing');
        later(() => {
          patch(order.id, 'synced');
          if (i === queued.length - 1) {
            const plural = queued.length > 1 ? 's' : '';
            setNote(`${queued.length} pedido${plural} sincronizado${plural} al reconectar.`);
          }
        }, 400);
      }, i * 480);
    });
  }, [online, orders, later, patch]);

  const pending = orders.filter((o) => o.state !== 'synced').length;

  return (
    <div className="screentone relative flex flex-col gap-3.5 overflow-hidden p-5 sm:p-6">
      {/* Líneas de concentración: el recurso del manga para marcar tensión */}
      <div className={cn('speedlines', !online && 'speedlines-on')} aria-hidden="true" />

      {/* Onomatopeya del corte, en español y no en kanji decorativo */}
      {boom && (
        <div
          className="pointer-events-none absolute top-[38%] left-1/2 z-5 -translate-x-1/2 -translate-y-1/2 rotate-[-9deg] text-center font-impact text-5xl font-black whitespace-nowrap text-paper uppercase sm:text-6xl"
          style={{
            WebkitTextStroke: '3px var(--color-ink)',
            paintOrder: 'stroke fill',
            animation: 'boom 0.9s var(--ease-out-expo) forwards',
          }}
          aria-hidden="true"
        >
          ¡Sin&nbsp;red!
        </div>
      )}

      <p className="m-0 flex items-center gap-2 font-mono text-[0.5625rem] tracking-[0.18em] text-slate uppercase">
        <span className="h-0.5 w-5 bg-red" aria-hidden="true" />
        Pruébalo · corta la red
      </p>

      {/* ── El teléfono ── */}
      <div className="relative z-2 mx-auto w-full max-w-[17rem] border-2 border-ink bg-paper p-1.5">
        <div
          className={cn('overflow-hidden border border-tone', !online && 'screentone-fine')}
          data-net={online ? 'on' : 'off'}
        >
          {/* Barra de estado */}
          <div
            className={cn(
              'flex items-center justify-between gap-2 border-b border-tone px-2.5 py-2 font-mono text-[0.5rem] tracking-[0.12em] uppercase transition-colors duration-300',
              !online && 'bg-ink text-paper',
            )}
          >
            <span>9:41</span>
            <span className="flex items-center gap-1.5 font-semibold">
              <span
                className={cn('size-1.5', online ? 'bg-ink' : 'animate-pulse bg-red')}
                aria-hidden="true"
              />
              <span data-testid="net-label">{online ? 'En línea' : 'Sin conexión'}</span>
            </span>
          </div>

          <div className="p-3">
            <div className="mb-2.5 flex items-baseline justify-between">
              <span className="font-impact text-base font-extrabold uppercase">Pedidos</span>
              <span className="font-mono text-[0.5rem] tracking-[0.08em] text-slate">
                {orders.length} registros
              </span>
            </div>

            <ul className="m-0 mb-3 flex min-h-32 list-none flex-col gap-1 p-0">
              {orders.slice(0, VISIBLE_ROWS).map((order) => (
                <li
                  key={order.id}
                  data-state={order.state}
                  className={cn(
                    'flex items-center gap-2 border border-tone bg-paper px-2 py-1.5 font-mono text-[0.5625rem]',
                    order.state === 'queued' && 'border-l-[3px] border-red',
                    order.state === 'syncing' && 'border-ink',
                  )}
                >
                  <span className="font-semibold">#{order.id}</span>
                  <span
                    className={cn(
                      'ml-auto flex items-center gap-1 text-[0.5rem] tracking-[0.06em] uppercase',
                      order.state === 'queued' && 'text-red',
                    )}
                  >
                    {order.state === 'syncing' && (
                      <span
                        className="size-1.5 animate-spin rounded-full border-[1.5px] border-current border-t-transparent"
                        aria-hidden="true"
                      />
                    )}
                    {LABEL[order.state]}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between border-t border-tone pt-2 font-mono text-[0.5rem] tracking-[0.1em] text-slate uppercase">
              <span>Cola local</span>
              <span>
                <b className="text-ink tabular-nums" data-testid="queue-count">
                  {pending}
                </b>{' '}
                pendientes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Controles ── */}
      <div className="relative z-2 flex gap-2">
        <button
          type="button"
          onClick={addOrder}
          className="flex-1 cursor-pointer border-2 border-ink bg-paper px-2 py-2.5 font-mono text-[0.5625rem] font-semibold tracking-[0.08em] uppercase transition-colors hover:bg-ink hover:text-paper"
        >
          + Pedido
        </button>
        <button
          type="button"
          onClick={toggleNetwork}
          data-testid="cut-network"
          className={cn(
            'flex-1 cursor-pointer border-2 px-2 py-2.5 font-mono text-[0.5625rem] font-semibold tracking-[0.08em] uppercase transition-colors',
            online
              ? 'border-ink bg-paper text-ink hover:bg-ink hover:text-paper'
              : 'border-red bg-red text-paper',
          )}
        >
          {online ? 'Cortar red' : 'Reconectar'}
        </button>
      </div>

      <p
        className="relative z-2 m-0 min-h-[2.4em] text-center font-mono text-[0.5rem] tracking-[0.06em] text-slate"
        role="status"
        aria-live="polite"
      >
        {note}
      </p>
    </div>
  );
}
