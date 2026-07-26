import { z } from 'astro/zod';

/**
 * Extraído de `content.config.ts` para poder testearlo con vitest sin
 * pasar por `astro:content` (que no resuelve fuera de Astro). El
 * runtime real sigue viviendo en `content.config.ts`, que importa
 * este mismo esquema.
 */
export const blogSchema = z.object({
  title: z.string().max(70, 'Máximo 70 caracteres o Google lo corta'),
  description: z.string().min(50).max(160),
  pubDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  tags: z.array(z.string()).min(1),
  draft: z.boolean().default(false),
  /** Imagen social propia; si falta se genera una por defecto */
  ogImage: z.string().optional(),
  /** Dificultad del artículo. Requerido: sin default posible, cada
   * post declara su nivel a propósito. */
  level: z.enum(['principiante', 'intermedio', 'avanzado']),
  /** Serie multi-parte opcional. `order` no puede existir sin `series`
   * porque vive anidado dentro del objeto, no como campo hermano. */
  series: z
    .object({
      name: z.string(),
      order: z.number().int().positive(),
    })
    .optional(),
});
