import { cn } from '../lib/cn'

/**
 * Reusable Tailwind abstraction for form field patterns.
 * Matches the Form Styling Standard requirements.
 * Using Tailwind utilities referencing semantic CSS variables.
 */
export const formFieldClasses = {
  container: 'flex flex-col gap-2',
  label: 'text-[10px] font-black uppercase tracking-widest text-text-secondary px-1',
  helper: 'text-[10px] font-black uppercase tracking-tighter text-text-secondary opacity-40 px-1',
  error: 'text-[10px] font-black uppercase tracking-tighter text-error px-1',
  input: cn(
    'h-14 w-full rounded-[1.25rem] border-2 border-border-subtle bg-white px-4 text-base font-black tracking-tight text-text-primary outline-none transition-all',
    'placeholder:text-text-secondary/30 hover:border-primary/30 focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/10',
    'dark:color-scheme-dark',
    'disabled:cursor-not-allowed disabled:bg-surface-secondary disabled:opacity-50',
    'aria-invalid:border-error/50 aria-invalid:focus-visible:ring-error/10',
  ),
}
