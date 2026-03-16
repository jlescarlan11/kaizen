import { cn } from '../lib/cn'

/**
 * Reusable Tailwind abstraction for form field patterns.
 * Matches the Form Styling Standard requirements.
 * Using Tailwind utilities referencing semantic CSS variables.
 */
export const formFieldClasses = {
  container: 'flex flex-col gap-1.5',
  label: 'text-sm font-medium leading-5 text-ui',
  helper: 'text-xs leading-5 text-ui-muted',
  error: 'text-xs leading-5 text-ui-danger-text-soft',
  input: cn(
    'h-11 w-full rounded-xl border border-ui-border bg-ui-surface px-3 text-sm leading-6 text-ui outline-none transition',
    'placeholder:text-ui-subtle hover:border-ui-border-strong focus-visible:border-ui-focus focus-visible:ring-3 focus-visible:ring-ui-focus/22',
    'dark:color-scheme-dark',
    'disabled:cursor-not-allowed disabled:text-ui-disabled disabled:opacity-(--ui-disabled-opacity)',
    'aria-invalid:border-ui-danger aria-invalid:focus-visible:ring-ui-danger/22',
  ),
}
