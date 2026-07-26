---
number: 46
title: 'Migrar el esquema de SQLite sin borrar la base'
pubDate: 2026-06-11
tag: 'sqlite'
---

`onUpgrade` recibe la versión antigua y la nueva. El error habitual es
escribir un `if` por versión; lo correcto es una cascada sin `else`, para que
un usuario que salta de la v1 a la v4 ejecute las tres migraciones en orden.

```dart
onUpgrade: (db, oldVersion, newVersion) async {
  if (oldVersion < 2) await db.execute('ALTER TABLE orders ADD COLUMN synced INTEGER DEFAULT 0');
  if (oldVersion < 3) await db.execute('CREATE INDEX idx_synced ON orders(synced)');
}
```
