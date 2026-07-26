---
number: 47
title: 'BlocSelector en vez de BlocBuilder'
pubDate: 2026-06-20
tag: 'bloc'
---

Si tu widget solo depende de un campo del estado, `BlocBuilder` lo
reconstruye cada vez que cambia cualquier otro campo. `BlocSelector` te deja
suscribirte a una sola porción.

```dart
BlocSelector<CartBloc, CartState, int>(
  selector: (state) => state.items.length,
  builder: (context, count) => Badge(count: count),
)
```

El widget solo se reconstruye cuando cambia el número de items, no cuando
cambia el total, el cupón o el estado de carga.
