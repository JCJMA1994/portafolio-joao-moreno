/**
 * Tracking de clics por delegación de eventos: un solo listener para
 * todos los enlaces de /links.
 *
 * Usa sendBeacon, que no bloquea ni cancela la navegación. Si el
 * navegador no lo soporta, no hacemos nada: el clic del visitante
 * siempre tiene prioridad sobre la métrica.
 */
const list = document.getElementById('link-list');

list?.addEventListener('click', (event) => {
  const target = event.target as HTMLElement | null;
  const anchor = target?.closest<HTMLAnchorElement>('a[data-link-label]');
  const label = anchor?.dataset.linkLabel;
  if (!label) return;

  const body = new Blob([JSON.stringify({ label })], { type: 'application/json' });
  navigator.sendBeacon?.('/api/click', body);
});
