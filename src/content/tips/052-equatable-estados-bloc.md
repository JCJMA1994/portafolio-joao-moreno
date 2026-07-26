---
number: 52
title: 'Sin Equatable, BLoC reconstruye aunque el estado sea igual'
pubDate: 2026-07-23
tag: 'bloc'
---

BLoC decide si reconstruir comparando el estado nuevo con el viejo. Si tu
estado no implementa igualdad por valor, dos instancias con los mismos datos
son distintas y la UI se repinta al pedo.

```dart
class OrderData extends OrderState with EquatableMixin {
  final List<Order> orders;
  const OrderData(this.orders);

  @override
  List<Object?> get props => [orders];
}
```

Con `props`, dos `OrderData` con la misma lista son iguales y BLoC no
reconstruye. Sin eso, cada `emit` es un rebuild garantizado. En Dart 3 también
puedes usar records o clases con `==` generado; el punto es que la igualdad
sea por valor, no por identidad.
