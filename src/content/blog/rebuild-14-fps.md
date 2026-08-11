---
title: 'Encontré el rebuild que me costaba 14 fps'
description: 'Cómo uso Flutter DevTools para localizar widgets que se reconstruyen sin motivo, con el proceso exacto que sigo paso a paso.'
pubDate: 2026-05-11
tags: ['rendimiento', 'flutter', 'devtools']
level: 'principiante'
number: 36
featured: false
series:
  name: 'Perfilar rebuilds'
  order: 1
---

La pantalla iba a 46 fps en un dispositivo de gama media y no había ninguna
animación compleja. El culpable era un `Provider` mal colocado que
reconstruía el árbol entero en cada frame.

Rellena con el caso real. Aquí va el proceso que sigo.

## El proceso

1. Abrir DevTools y activar el **Performance Overlay**.
2. Buscar las barras rojas en el gráfico de UI, no en el de raster.
3. Activar **Track Widget Rebuilds** y ordenar por número de reconstrucciones.
4. Envolver en `const` lo que no dependa del estado.
5. Volver a medir. Si no mides después, no has arreglado nada.
