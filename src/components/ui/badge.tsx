import * as React from 'react';
import { cn } from '@/lib/utils';

/** Chip de tecnología. Sin JS: se renderiza estático desde Astro. */
export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        'inline-block border border-ink px-1.5 py-0.5 font-mono text-[0.5rem] tracking-[0.1em] uppercase',
        className,
      )}
      {...props}
    />
  );
}
