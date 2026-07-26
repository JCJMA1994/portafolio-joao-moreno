---
title: 'Remote Config como interruptor de emergencia, no solo para A/B'
description: 'Firebase Remote Config sirve para apagar una feature rota en producción sin pasar por la revisión de la store. El patrón kill switch y sus trampas.'
pubDate: 2026-07-25
tags: ['flutter', 'firebase', 'remote-config']
---

Casi todo el mundo conoce Remote Config para experimentos A/B. Su uso más
valioso es otro: **apagar una feature que sale rota en producción sin esperar
dos días a que Apple revise un hotfix.** Eso es un kill switch.

## El patrón

Cada feature de riesgo lleva una bandera booleana en Remote Config.

```dart
final remoteConfig = FirebaseRemoteConfig.instance;

await remoteConfig.setDefaults({
  'new_checkout_enabled': false, // por defecto apagado: fallar cerrado
});

await remoteConfig.setConfigSettings(RemoteConfigSettings(
  fetchTimeout: const Duration(seconds: 10),
  minimumFetchInterval: const Duration(hours: 1),
));

await remoteConfig.fetchAndActivate();

if (remoteConfig.getBool('new_checkout_enabled')) {
  return const NewCheckout();
}
return const LegacyCheckout();
```

Si el checkout nuevo empieza a fallar, cambias la bandera a `false` en la
consola de Firebase y en la próxima sesión los usuarios vuelven al viejo. Sin
release, sin revisión de store.

## Las trampas que muerden

1. **El default correcto es el estado seguro.** Si la feature nueva es la
   arriesgada, su default es `false`. La primera vez que la app arranca sin
   red, usa el default: que ese default no rompa nada.
2. **`minimumFetchInterval` te engaña en desarrollo.** Por defecto Firebase
   cachea una hora. Cambias la bandera en la consola, recargas, y no ves el
   cambio. En debug bájalo a cero; en producción déjalo alto para no gastar
   cuota.
3. **`fetchAndActivate` puede tardar o fallar.** No bloquees el arranque de la
   app esperándolo. Arranca con los defaults y activa la config cuando llegue.

## Por qué no es lo mismo que un `if` en el código

Un `if` hardcodeado necesita un release para cambiar. Remote Config te da la
palanca en caliente. Es la diferencia entre "reviértelo en dos minutos" y
"reviértelo cuando Apple te apruebe el hotfix".

Rellena con un caso donde te habría salvado —o te salvó— tener un kill switch.
