---
title: 'BLoC o Cubit: cómo decido en cada pantalla'
description: 'Una regla simple basada en cuántos eventos distintos tiene el flujo, en lugar de decidir por costumbre o por preferencia del equipo.'
pubDate: 2026-06-02
tags: ['estado', 'flutter', 'bloc']
---

La discusión de BLoC contra Cubit suele resolverse por costumbre: el equipo
usa uno y ya está. Llevo tres años cambiando de opinión y ahora tengo una
regla que me funciona.

## La regla

Cuenta los eventos distintos que puede recibir la pantalla. Si son tres o
menos y ninguno necesita transformarse, usa Cubit. Si hay más, o si necesitas
`debounce`, `throttle` o descartar eventos anteriores, usa BLoC.

Rellena con tu razonamiento y tus ejemplos reales.

## Por qué el criterio es el número de eventos

Cubit expone métodos. BLoC expone un flujo de eventos que puedes
transformar. Ese es el único diferencial que importa en la práctica: si no
vas a transformar el flujo, la ceremonia de los eventos no te paga nada.
