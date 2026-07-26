---
number: 50
title: 'Un índice en SQLite por cada columna del WHERE'
pubDate: 2026-07-16
tag: 'sqlite'
---

Si consultas la outbox por `status = 'pending'` en cada drenado y esa columna
no tiene índice, SQLite recorre la tabla entera. Con miles de filas, se nota.

```sql
CREATE INDEX idx_outbox_status ON outbox(status);
```

Regla: toda columna que aparezca en un `WHERE` o un `ORDER BY` frecuente
merece un índice. El coste es algo de escritura y espacio; la ganancia en
lectura es de orden de magnitud.
