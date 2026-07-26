import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Componente shadcn adaptado a los tokens manga.
 * Sombra dura desplazada en lugar de la difusa por defecto: en este
 * sistema visual la profundidad es tinta desplazada, no luz.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap border-2 border-ink font-mono text-[0.6875rem] font-semibold tracking-[0.08em] uppercase transition-[transform,box-shadow] duration-200 ease-out-expo focus-visible:outline-3 focus-visible:outline-red focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
  {
    variants: {
      variant: {
        solid:
          'bg-ink text-paper shadow-[4px_4px_0_0_var(--color-red)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-red)]',
        ghost:
          'bg-paper text-ink shadow-[4px_4px_0_0_var(--color-tone)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_0_var(--color-tone)]',
        flat: 'bg-paper text-ink hover:bg-ink hover:text-paper',
      },
      size: {
        default: 'px-5 py-3',
        sm: 'px-3 py-2 text-[0.5625rem]',
        icon: 'size-8 p-0',
      },
    },
    defaultVariants: { variant: 'solid', size: 'default' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = 'Button';

export { buttonVariants };
