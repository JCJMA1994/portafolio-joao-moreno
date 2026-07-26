---
number: 51
title: 'connectivity_plus dice "hay wifi", no "hay internet"'
pubDate: 2026-07-19
tag: 'flutter'
---

`connectivity_plus` te dice si el dispositivo está conectado a una red, no si
esa red llega a tu servidor. Un wifi de aeropuerto con portal cautivo reporta
`wifi` y no navega.

Úsalo como señal para *intentar* sincronizar, no como prueba de que va a
funcionar. La verdad la da el request:

```dart
final result = await Connectivity().checkConnectivity();
if (result != ConnectivityResult.none) {
  await _tryDrain(); // que este maneje su propio fallo
}
```

Si tratas "hay red" como "el POST va a salir bien", vuelves a tener el bug que
la cola offline venía a resolver.
