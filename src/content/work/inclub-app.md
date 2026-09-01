---
title: 'INCLUB App Financiera & Transaccional'
org: 'INCLUB'
kind: 'Fintech / Offline-first'
stack: ['Flutter', 'Dart', 'SQLite', 'BLoC', 'REST', 'Shorebird', 'Sentry']
summary: 'Plataforma móvil financiera con arquitectura por capas, verificación biométrica KYC y sincronización offline-first con SQLite para operar bajo conectividad intermitente.'
outcome: '99.5% de sesiones crash-free y sincronización bidireccional automática sin pérdida de transacciones.'
order: 1
---

## Contexto

En aplicaciones financieras y de gestión de operaciones, la conectividad inestable en campo o en zonas con baja cobertura no puede ser una excusa para perder una transacción o congelar la experiencia del usuario. El proyecto requería una plataforma móvil robusta capaz de procesar pagos, gestionar membresías y verificar identidades de forma ágil y segura.

## El desafío técnico

- **Operaciones transaccionales en offline:** Los usuarios necesitaban registrar información y operaciones críticas aun sin acceso inmediato a internet.
- **Verificación de identidad (KYC):** Integración de lectura y validación de documentos oficiales peruanos (`dni_peru_ocr`) con validaciones biométricas y de integridad.
- **Entrega continua sin fricción:** Despliegue de actualizaciones críticas y corrección de bugs en producción sin depender exclusivamente de los tiempos de revisión de las tiendas de aplicaciones.

## Solución de ingeniería

1. **Arquitectura por capas (Clean Architecture) y BLoC:**
   Separación estricta entre capa de datos (_data sources_, repositorios y contratos de persistencia local), capa de dominio (casos de uso de negocio) y capa de presentación con estados inmutables manejados mediante `flutter_bloc`.

2. **Cola de persistencia offline con SQLite:**
   Implementación de una cola de sincronización transaccional local. Toda mutación se persiste de forma determinista con estados (`pending`, `syncing`, `failed`), garantizando reintentos exponenciales y resolución de conflictos al recuperar señal.

3. **Observabilidad y Hot Updates:**
   Monitoreo centralizado de excepciones y métricas de rendimiento con **Sentry**, complementado con entregas de parches de código mediante **Shorebird** para mitigar incidentes en producción en cuestión de minutos.

## Resultados e impacto

- **99.5% de sesiones libres de caídas (crash-free)** monitoreadas en Sentry en producción.
- Flujo KYC automatizado con reducción del tiempo de verificación de usuario de minutos a segundos.
- Cero reportes de pérdida de información en formularios complejos durante caídas de señal móvil.
