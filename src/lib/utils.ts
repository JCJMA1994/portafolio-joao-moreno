import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Utilidad estándar de shadcn: combina clases resolviendo conflictos. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Tiempo de lectura en minutos. 200 palabras/min es el promedio
 * para prosa técnica en español; por debajo de 1 min mostramos 1.
 */
export function readingTime(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/** Cuenta palabras. Se usa para decidir si un apunte merece URL propia. */
export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Umbral por debajo del cual un apunte NO tiene página propia. */
export const THIN_CONTENT_THRESHOLD = 300;

export function deservesOwnPage(body: string): boolean {
  return wordCount(body) >= THIN_CONTENT_THRESHOLD;
}

export function formatDate(date: Date, locale = 'es-PE'): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
