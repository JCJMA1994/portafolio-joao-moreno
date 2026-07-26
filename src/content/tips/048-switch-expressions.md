---
number: 48
title: 'switch expression en vez de la cadena de if-else'
pubDate: 2026-07-09
tag: 'dart'
---

Desde Dart 3, `switch` es una expresión: devuelve un valor. Adiós a la
variable mutable que ibas rellenando en cada `if`.

```dart
final label = switch (status) {
  Status.active => 'Activo',
  Status.paused => 'En pausa',
  Status.done => 'Terminado',
};
```

Si `status` es un `enum` o un `sealed`, el compilador exige que cubras todos
los casos. Un `if-else` no te obliga a nada y deja huecos silenciosos.
