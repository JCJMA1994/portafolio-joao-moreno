---
title: 'Perfilar rebuilds: por qué esa lista salta a 14 fps'
description: 'Cómo encontrar el widget que se reconstruye de más con el Rebuild Stats de DevTools, y las tres causas que explican el 90% de los jank en listas de Flutter.'
pubDate: 2026-07-25
tags: ['flutter', 'rendimiento', 'devtools']
---

Una lista que baja de 60 a 14 fps casi nunca es culpa de Flutter: es un widget
reconstruyéndose miles de veces por segundo sin necesidad. El error es
optimizar a ojo. Primero se mide.

## La herramienta: Rebuild Stats

En Flutter DevTools, la pestaña **Performance** tiene "Track Widget Builds".
Actívala, interactúa con la pantalla lenta y mira qué widget acumula miles de
rebuilds. Ese número es tu culpable, no tu intuición.

Sin este paso vas a ciegas y terminas metiendo `const` en sitios que no
importan (ver el apunte sobre `const`).

## Causa 1: el provider demasiado arriba

Un `BlocBuilder` alto en el árbol reconstruye todo lo de abajo cuando cambia
cualquier campo. La solución es `BlocSelector` sobre la porción exacta que ese
widget necesita, o mover el builder más abajo.

## Causa 2: crear objetos en el `build`

```dart
// Mal: cada rebuild crea un controller nuevo y rompe el estado.
Widget build(BuildContext context) {
  final controller = ScrollController(); // ❌
  return ListView(controller: controller);
}
```

Los objetos con estado —controllers, animaciones, streams— van en `initState`
o en un provider, nunca en `build`. El `build` debe ser barato y sin efectos.

## Causa 3: `ListView` en vez de `ListView.builder`

`ListView(children: [...])` construye los mil elementos de golpe, estén o no
en pantalla. `ListView.builder` solo construye los visibles. Para cualquier
lista que no quepa entera en pantalla, `builder` no es opcional.

## El orden correcto de trabajo

1. Mide con Rebuild Stats. Encuentra el widget culpable.
2. Identifica cuál de las tres causas aplica.
3. Corrige solo eso y vuelve a medir.

Optimizar sin medir es cambiar código al azar y rezar. Con DevTools, cada
cambio tiene un antes y un después que puedes probar.

Rellena con un caso concreto tuyo: qué lista saltaba, qué causa era, cuántos
fps recuperaste.
