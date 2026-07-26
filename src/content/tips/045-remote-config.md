---
number: 45
title: 'Remote Config como interruptor de funciones'
pubDate: 2026-05-28
tag: 'firebase'
---

Publicar en Play Store tarda horas y la revisión puede tardar días. Si una
función nueva sale mal, no quieres depender de un release para apagarla.

Envuelve cada función nueva en un booleano de Remote Config con
`fetchAndActivate` al arrancar y un valor por defecto seguro en local. Si
algo se rompe en producción, lo apagas desde la consola en un minuto.
