---
title: 'BeyScore — Ecosistema de Arbitraje & Torneos'
org: 'Open Source'
kind: 'Desktop & Mobile / Offline-first'
stack: ['Flutter', 'Dart', 'Melos', 'Clean Architecture', 'Offline-first', 'PDF Engine']
summary: 'Monorepo con tres aplicaciones Flutter especializadas para el arbitraje de combates físicos de Beyblade X y la gestión integral de torneos en entornos sin conexión a internet.'
outcome: 'Arquitectura monorepo con Melos, motor determinista de brackets y generación offline de diplomas oficiales en PDF.'
image: '/images/work/beyscore.jpg'
imageAlt: 'Mockup del sistema de gestión de torneos y scorecards BeyScore'
order: 3
---

## Contexto

Los torneos físicos competitivos de Beyblade X se desarrollan en convenciones, clubes y centros comunitarios con altos niveles de ruido acústico y donde la conectividad a internet suele ser nula o inestable. Los jueces y organizadores requerían una herramienta confiable para registrar puntuaciones en tiempo real, validar barajas de piezas y calcular cuadros eliminatorios sin depender de la nube.

## El desafío técnico

- **Operación 100% Offline-First:** Toda la lógica de torneos, cuadros de eliminación y estadísticas debe persistir localmente y funcionar sin señal.
- **Monorepo y código compartido:** Orquestar tres clientes Flutter distintos (Jugador, Organizador y Mesa de Arbitraje) compartiendo lógica de dominio, modelos y diseño.
- **Motor de reglas estricto:** Validación algorítmica de combinaciones de piezas (regla oficial 3on3) y generación matemática determinista de cuadros de eliminación directa, doble eliminación y sistema suizo.
- **Generación de documentos en el dispositivo:** Emisión instantánea de diplomas y certificados en PDF sin llamadas a servicios backend.

## Solución de ingeniería

1. **Monorepo escalable con Melos:**
   Estructuración de paquetes modulares desacoplados: paquetes de dominio puro (reglas y entidades), paquetes de infraestructura local y paquetes de diseño reutilizable consumidos por las tres aplicaciones.

2. **Tres aplicaciones especializadas:**
   - **App Player:** Constructor y validador de barajas 3on3 (bloqueo automático de piezas duplicadas), catálogo de componentes y ficha técnica con código QR.
   - **App Organizer:** Panel de administración de torneos (categorías Open y Regular, niveles G3 a GP), orquestador de brackets y exportación de actas.
   - **App Table:** Marcador ergonómico para árbitros con botones de gran formato para registro veloz de tipos de victoria (_Spin, Burst, Over, Xtreme Finish_).

3. **Motor de torneos y generación PDF nativa:**
   Algoritmos deterministas de emparejamiento y pipeline de renderizado vectorial de diplomas en PDF ejecutado íntegramente en el cliente.

## Resultados e impacto

- Ecosistema completo publicado en GitHub ([JCJMA1994/beyscore](https://github.com/JCJMA1994/beyscore)).
- Reducción a cero de errores de emparejamiento manual en mesas de torneo.
- Tiempo de emisión de diplomas reducido de minutos manuales a generación instantánea de 1 clic.
