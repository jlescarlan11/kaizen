import { cn } from '../lib/cn'

/**
 * Reusable Tailwind abstraction for form field patterns.
 * Matches the Form Styling Standard requirements.
 * Using Tailwind utilities referencing semantic CSS variables.
 */
export const formFieldClasses = {
  container: 'flex flex-col gap-1',
  label: 'text-sm font-medium leading-none text-foreground',
  helper: 'text-xs leading-5 text-muted-foreground',
  error: 'text-xs leading-5 text-ui-danger-text-soft',
  input: cn(
    'h-11 w-full rounded-xl border border-ui-border bg-ui-surface px-3 text-base leading-7 text-foreground outline-none transition',
    'placeholder:text-subtle-foreground hover:border-ui-border-strong focus-visible:border-ui-focus focus-visible:ring-3 focus-visible:ring-ui-focus/22',
    'dark:color-scheme-dark',
    'disabled:cursor-not-allowed disabled:text-muted-foreground disabled:opacity-60',
    'aria-invalid:border-ui-danger aria-invalid:focus-visible:ring-ui-danger/22',
  ),
}
