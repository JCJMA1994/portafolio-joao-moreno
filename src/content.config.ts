import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/**
 * Los esquemas son la red de seguridad del contenido: si te olvidas
 * de una descripción o pones una fecha inválida, el build falla en
 * lugar de publicar una página sin metaetiquetas.
 */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string().max(70, 'Máximo 70 caracteres o Google lo corta'),
    description: z.string().min(50).max(160),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).min(1),
    draft: z.boolean().default(false),
    /** Imagen social propia; si falta se genera una por defecto */
    ogImage: z.string().optional(),
  }),
});

const tips = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/tips' }),
  schema: z.object({
    /** Número permanente. Es una dirección estable, no un adorno. */
    number: z.number().int().positive(),
    title: z.string().max(70),
    pubDate: z.coerce.date(),
    tag: z.string(),
    draft: z.boolean().default(false),
  }),
});

const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    org: z.string(),
    kind: z.string(),
    stack: z.array(z.string()).min(1),
    summary: z.string(),
    /** Resultado medible. Sin esto la tarjeta no convence a nadie. */
    outcome: z.string().optional(),
    order: z.number().int().default(99),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog, tips, work };
