---
title: 'Suite Móvil Multiplataforma'
org: 'WMIND'
kind: 'App móvil / Firebase & Cloud'
stack: ['Flutter', 'Dart', 'Firebase', 'Firestore', 'Remote Config', 'Spring Boot']
summary: 'Arquitectura móvil conectada a backend Spring Boot y suite de Firebase para autenticación segura, persistencia local y distribución dinámica con feature flags.'
outcome: '30+ pantallas modulares entregadas con telemetría en tiempo real y despliegue continuo en Google Play.'
order: 2
---

## Contexto

Desarrollo de módulos móviles multiplataforma integrados a un ecosistema empresarial con backend centralizado en Spring Boot, donde la coherencia en la experiencia de usuario y la estabilidad operativa eran prioritarias.

## El desafío técnico

- **Evolución continua de pantallas y flujos:** Diseñar un sistema de componentes desacoplado y reutilizable para acelerar el desarrollo de más de 30 pantallas.
- **Manejo consistente de estados de carga y error:** Evitar pantallas en blanco o bloqueos visuales mediante estados honestos y recuperación automática de caídas de red.
- **Distribución y control de funcionalidades:** Habilitar o pausar características específicas por versión de app y perfil de usuario sin forzar actualizaciones obligatorias inmediatas.

## Solución de ingeniería

1. **Patrón Container-Presentational y modularización:**
   Estructuración de widgets tontos (_stateless_) enfocados en el renderizado puro y componentes contenedores responsables de escuchar los streams de estado y despachar eventos.

2. **Integración profunda con Firebase y Backend REST:**
   - Autenticación segura mediante tokens JWT y Spring Security.
   - Configuración remota con **Firebase Remote Config** para controlar el rollout de nuevas características (_feature flagging_).
   - Base de datos local SQLite para caché de entidades frecuentes y consulta rápida en modo offline.

3. **Ciclo de vida de releases y control de calidad:**
   Estandarización de flujos de trabajo en Scrum (Jira/Bitbucket) con pipelines automáticos de compilación y publicación periódica en Google Play Console.

## Resultados e impacto

- Entrega de más de 30 vistas complejas con alto estándar visual y apego a los lineamientos de diseño.
- Reducción sustancial del tiempo de onboarding de nuevos desarrolladores al stack gracias a la arquitectura modular.
- Capacidad de activar y desactivar flujos en caliente ante incidentes de backend sin necesidad de publicar nuevos binarios.
