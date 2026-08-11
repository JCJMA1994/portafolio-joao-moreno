---
title: 'Cola de sincronización offline: que la app sirva en un ascensor'
description: 'El patrón outbox aplicado a Flutter con SQLite: encolar la mutación local, marcarla como pendiente y drenar la cola al reconectar. Sin perder datos.'
pubDate: 2026-07-22
tags: ['flutter', 'sqlite', 'offline', 'arquitectura']
level: 'avanzado'
number: 40
featured: true
series:
  name: 'Offline-first'
  order: 2
---

"Offline-first" suena a eslogan hasta que el usuario está en un ascensor y
pulsa "guardar". La app no debe fallar ni mentir con un spinner infinito:
debe aceptar la acción, guardarla localmente y sincronizar cuando vuelva la
red. El patrón que uso para esto es el **outbox**.

## La idea en una frase

Toda mutación se escribe primero en SQLite con un estado `pending`. La UI lee
de SQLite, no del servidor. Un proceso aparte drena las pendientes cuando hay
conexión.

## La tabla

```sql
CREATE TABLE outbox (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity TEXT NOT NULL,
  payload TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  retries INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
```

## El flujo, en pseudocódigo Dart

```dart
Future<void> createOrder(Order order) async {
  // 1. Escribe local y marca pendiente. La UI ya puede reflejarlo.
  await db.insert('outbox', {
    'entity': 'order',
    'payload': jsonEncode(order.toJson()),
    'status': 'pending',
    'created_at': DateTime.now().millisecondsSinceEpoch,
  });
  // 2. Intenta drenar. Si no hay red, no pasa nada: queda encolado.
  unawaited(_drain());
}

Future<void> _drain() async {
  final pending = await db.query('outbox',
      where: 'status = ?', whereArgs: ['pending']);
  for (final row in pending) {
    try {
      await api.post(row['payload']);
      await db.update('outbox', {'status': 'done'},
          where: 'id = ?', whereArgs: [row['id']]);
    } catch (_) {
      // Sin red o error del server: incrementa retries, no borres nada.
      await db.rawUpdate(
          'UPDATE outbox SET retries = retries + 1 WHERE id = ?',
          [row['id']]);
    }
  }
}
```

## Los tres detalles que separan un demo de algo serio

1. **Idempotencia.** Si el POST llega al server pero la respuesta se pierde,
   al reintentar creas un duplicado. Manda un `client_id` único por mutación y
   deja que el server ignore los repetidos.
2. **Nunca borres una pendiente por un error.** Un `503` del server no es
   motivo para tirar el dato del usuario. Incrementa `retries` y reintenta con
   backoff.
3. **Dispara el drenado al recuperar conexión**, con `connectivity_plus`, no
   solo al crear. El usuario puede encolar tres cosas sin red y salir de la
   app.

Rellena con las cifras reales de tu app: cuántas mutaciones offline maneja,
qué tasa de sincronización lograste.
