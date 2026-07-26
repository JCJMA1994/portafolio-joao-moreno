---
title: 'Records de Dart 3: devolver dos valores sin crear una clase'
description: 'Cuándo un record reemplaza a una clase de una sola vez y cuándo sigue haciendo falta el tipo con nombre. La regla es la duración de vida del dato.'
pubDate: 2026-07-08
tags: ['dart', 'dart-3', 'records']
level: 'principiante'
---

Antes de Dart 3, devolver dos valores desde una función te dejaba tres
opciones malas: una clase de un solo uso, una `List` sin tipos, o parámetros
`out` que Dart no tiene. Los records resuelven el caso, pero se abusan de
ellos apenas salen. Esta es la regla con la que decido.

## El caso donde el record gana

Un valor que nace y muere dentro de la misma función. Parsear, validar,
partir una cadena: el resultado no cruza capas.

```dart
(int, String) parseLine(String raw) {
  final parts = raw.split(':');
  return (int.parse(parts[0]), parts[1].trim());
}

final (code, message) = parseLine('404: no encontrado');
```

Sin clase, sin ceremonia, y con desestructuración en el sitio de uso. El
tipo `(int, String)` ya dice todo lo que hay que saber.

## Records con nombre cuando el orden confunde

Dos `int` seguidos son una trampa: nadie recuerda si es `(ancho, alto)` o
`(alto, ancho)`. Ponles nombre.

```dart
({int width, int height}) imageSize(Uint8List bytes) {
  // ...
  return (width: 1200, height: 630);
}

final size = imageSize(bytes);
print(size.width);
```

## Dónde el record es la decisión equivocada

Cuando el dato **cruza una capa** de tu Clean Architecture. Si un repositorio
devuelve un record al dominio, estás filtrando una estructura anónima donde
debería viajar una entidad con nombre, invariantes y, quizá, métodos.

La regla corta: **record para lo que vive y muere en una función; clase o
entidad para lo que viaja entre capas.** El día que necesites añadirle un
método o una validación, el record te obliga a refactorizar todos los sitios
de uso. La clase, no.

Rellena con un ejemplo real tuyo de INCLUB donde un record te ahorró una
clase de un solo uso.
