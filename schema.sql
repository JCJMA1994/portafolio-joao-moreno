-- Esquema de la analítica de clics de /links
--
-- Ejecútalo una sola vez contra tu base de Turso:
--   turso db shell tu-base < schema.sql
--
-- Deliberadamente NO se guarda IP, cookie ni huella del navegador: solo
-- agregados anónimos. Así no necesitas banner de consentimiento bajo el
-- RGPD ni la Ley 29733 de protección de datos personales del Perú.

CREATE TABLE IF NOT EXISTS click (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  -- Etiqueta del enlace pulsado, validada contra src/data/links.ts
  label      TEXT    NOT NULL,
  -- URL de destino, para no perder el dato si renombras la etiqueta
  target     TEXT    NOT NULL,
  created_at TEXT    NOT NULL DEFAULT (datetime('now')),
  -- Solo el dominio de procedencia, nunca la ruta completa
  referrer   TEXT,
  -- País, de la cabecera que añade Vercel. Nada más granular.
  country    TEXT,
  device     TEXT
);

CREATE INDEX IF NOT EXISTS idx_click_label      ON click (label);
CREATE INDEX IF NOT EXISTS idx_click_created_at ON click (created_at);
