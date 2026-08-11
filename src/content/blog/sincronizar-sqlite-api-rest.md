---
title: 'Sincronizar SQLite con una API REST sin perder datos'
description: 'La cola de escrituras pendientes es la parte que nadie explica en los tutoriales de offline-first. Así la implemento en Flutter.'
pubDate: 2026-07-14
tags: ['arquitectura', 'sqlite', 'flutter']
level: 'intermedio'
number: 38
featured: false
series:
  name: 'Offline-first'
  order: 1
---

Casi todos los tutoriales de offline-first en Flutter terminan donde empieza
el problema real: guardan en SQLite, muestran los datos y dan por hecho que
la sincronización es un detalle de implementación.

No lo es. La sincronización es el sistema.

## El caso que rompe la implementación naíf

Un repartidor registra ocho entregas en un sótano sin cobertura. Sale a la
calle, recupera señal, y la app manda las ocho peticiones a la vez. Tres
fallan por un timeout del servidor. ¿Qué ve el usuario?

En la implementación naíf: cinco entregas guardadas y tres desaparecidas,
sin ningún aviso.

## Una tabla de operaciones pendientes

La solución no es reintentar la petición. Es no tratar la petición como la
fuente de verdad. Escribe siempre en local primero, y guarda aparte la
intención de sincronizar.

```dart
// La cola no guarda datos, guarda operaciones.
// Así el orden se preserva y cada intento es idempotente.
await db.insert('sync_queue', {
  'entity': 'delivery',
  'entity_id': delivery.id,
  'operation': 'create',
  'payload': jsonEncode(delivery.toJson()),
  'attempts': 0,
  'created_at': DateTime.now().toIso8601String(),
});
```

Rellena el resto del artículo con tu experiencia real. Este archivo es la
plantilla: el frontmatter ya está validado por el esquema de contenido, así
que si te olvidas de la descripción el build falla antes de publicar.

## Lo que aprendí

- La cola se procesa **en serie**, no en paralelo. El orden importa.
- Cada operación necesita una clave de idempotencia, o el reintento duplica.
- El contador de intentos evita el bucle infinito con un error permanente.
