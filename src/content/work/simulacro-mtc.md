---
title: 'Simulacro MTC — Examen de Reglas Oficial'
org: 'Open Source'
kind: 'App móvil / EdTech'
stack: ['Flutter', 'Dart', 'BLoC', 'Clean Architecture', 'FastAPI', 'SQLite']
summary: 'Aplicación móvil de alto rendimiento y arquitectura limpia para la preparación del examen de reglas de tránsito del MTC (Perú) con diagnóstico granular por tema y soporte de las 9 categorías oficiales.'
outcome: 'Motor de evaluación con reglas de negocio del MTC, feedback analítico por área y backend en FastAPI para sincronización de balotarios.'
image: '/images/work/simulacro-mtc.jpg'
imageAlt: 'Mockup del simulador de exámenes de reglas de tránsito del MTC'
order: 4
---

## Contexto

El examen de conocimientos de reglas de tránsito del Ministerio de Transportes y Comunicaciones (MTC - Perú) es el requisito obligatorio para obtener o revalidar cualquier licencia de conducir en el país. Los postulantes suelen estudiar con bancos de preguntas estáticos que no ofrecen retroalimentación específica sobre qué temas específicos necesitan reforzar.

## El desafío técnico

- **Reglas de dominio complejas por categoría:** Cada una de las 9 categorías de licencia (desde A-I particular hasta B-IIc mototaxis y transporte pesado A-IIIc) cuenta con parámetros de evaluación distintos, variaciones en cantidad de preguntas (40 vs 35 en B-IIa) y notas mínimas aprobatorias.
- **Diagnóstico y feedback granular:** Calcular en tiempo real el desglose de rendimiento por área temática (señalización, mecánica básica, primeros auxilios, infracciones) en lugar de un simple puntaje numérico final.
- **Sincronización de balotarios oficiales:** Mantener los bancos de preguntas actualizados con los decretos supremos del MTC mediante un pipeline automatizado.

## Solución de ingeniería

1. **Clean Architecture por Features y BLoC:**
   - **Capa de Dominio:** Entidades inmutables y casos de uso puros con cero dependencias del framework Flutter ni paquetes externos.
   - **Capa de Presentación:** Gestión reactiva con `flutter_bloc` (`ExamBloc`), control de temporizador y retroalimentación interactiva por pregunta.
   - **Capa de Datos:** Repositorios locales SQLite para almacenamiento de intentos históricos y caché offline.

2. **Backend de ingestión en FastAPI (Python):**
   Servicio ligero para procesar balotarios oficiales en PDF/JSON, versionar bancos de preguntas y proveer endpoints de sincronización delta al cliente móvil.

3. **Diagrama interactivo de arquitectura con Archify:**
   Documentación formal de arquitectura del sistema generada a partir de especificaciones JSON ([JCJMA1994/simulacro_mtc](https://github.com/JCJMA1994/simulacro_mtc)).

## Resultados e impacto

- Cobertura completa de las 9 categorías de licencia de conducir oficiales del MTC.
- Identificación instantánea de debilidades temáticas para el postulante antes de rendir el examen oficial.
- Arquitectura desacoplada y testeable con separación total de lógica de negocio.
