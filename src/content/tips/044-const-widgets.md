---
number: 44
title: 'const en widgets: cuándo importa de verdad'
pubDate: 2026-05-14
tag: 'dart'
---

`const` en un widget no acelera el pintado: evita que Flutter cree una
instancia nueva y, sobre todo, permite que el algoritmo de reconciliación
descarte el subárbol por identidad.

Importa cuando el widget está dentro de algo que se reconstruye a menudo. En
una pantalla estática no cambia nada medible, así que no llenes el código de
`const` por costumbre: ponlo donde haya reconstrucciones.
