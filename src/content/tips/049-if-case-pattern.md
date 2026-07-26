---
number: 49
title: 'if-case: desestructurar y comprobar en una línea'
pubDate: 2026-07-12
tag: 'dart'
---

Cuando solo te interesa un caso de un `sealed` o un tipo, no montes un switch
entero. `if-case` comprueba el patrón y extrae el dato de una vez.

```dart
if (response case Success(:final data)) {
  render(data);
}
```

Equivale a comprobar `is Success` y luego acceder a `.data`, pero sin el cast
intermedio ni la variable extra. Si no coincide, el bloque no entra.
