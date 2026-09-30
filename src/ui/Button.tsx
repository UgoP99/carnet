import type { ButtonHTMLAttributes, Ref } from 'react';

const VARIANT_CLASSES = {
  primary: 'bg-sky-600 text-white hover:bg-sky-500 active:bg-sky-700',
  secondary:
    'bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
  ghost:
    'bg-transparent text-slate-900 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800',
  danger: 'bg-red-600 text-white hover:bg-red-500 active:bg-red-700',
} as const;

export type ButtonVariant = keyof typeof VARIANT_CLASSES;

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  ref?: Ref<HTMLButtonElement>;
}

export function Button({ variant = 'primary', className = '', ref, ...props }: ButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      className={`inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}
