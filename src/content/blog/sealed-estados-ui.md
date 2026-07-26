---
title: 'Estados de UI con sealed: el compilador te obliga a no olvidar ninguno'
description: 'Modelar loading, error y datos con clases sealed y switch exhaustivo. Si añades un estado y olvidas pintarlo, el build falla en vez de la pantalla en blanco.'
pubDate: 2026-07-15
tags: ['dart', 'dart-3', 'flutter', 'estado']
level: 'intermedio'
---

El bug clásico de una pantalla con estados: agregas un estado nuevo —digamos
`empty`— y olvidas manejarlo en el `build`. La app no revienta: muestra una
pantalla en blanco y el usuario no entiende nada. Con `sealed` de Dart 3, ese
olvido lo caza el compilador.

## El estado como jerarquía sellada

```dart
sealed class OrderState {}

class OrderLoading extends OrderState {}

class OrderEmpty extends OrderState {}

class OrderData extends OrderState {
  final List<Order> orders;
  OrderData(this.orders);
}

class OrderError extends OrderState {
  final String message;
  OrderError(this.message);
}
```

`sealed` significa que todas las subclases están en este archivo. El
compilador conoce el conjunto completo.

## El switch que no te deja olvidar un caso

```dart
Widget build(BuildContext context) {
  return switch (state) {
    OrderLoading() => const CircularProgressIndicator(),
    OrderEmpty() => const Text('No hay pedidos'),
    OrderData(:final orders) => OrderList(orders),
    OrderError(:final message) => ErrorBanner(message),
  };
}
```

Fíjate en `OrderData(:final orders)`: eso desestructura el campo directamente
en el patrón, sin castear ni acceder con `.orders` después.

## La parte que de verdad importa

Si mañana añades `OrderOffline extends OrderState` y no lo agregas al switch,
**el build falla** con un error de exhaustividad. No es un `default` que traga
el caso silenciosamente: es el compilador diciéndote "te falta pintar este
estado". Para una app offline-first, donde los estados de conexión se
multiplican, esa red de seguridad vale oro.

Comparado con el viejo `if (state is OrderLoading) ... else if ...`, aquí no
hay forma de que un estado quede sin pintar y llegue a producción.

Rellena con el caso de tu app donde un estado sin manejar te costó un bug en
producción.
