/**
 * Shared typography roles strictly following @CODING_STANDARDS.md
 */
export const typography = {
  display:
    'font-display text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-foreground',
  h1: 'text-3xl md:text-4xl font-semibold tracking-tight leading-tight text-foreground',
  h2: 'text-2xl md:text-3xl font-semibold tracking-tight leading-snug text-foreground',
  h3: 'text-xl md:text-2xl font-semibold tracking-tight leading-snug text-foreground',
  h4: 'text-lg md:text-xl font-medium leading-snug text-foreground',
  'body-lg': 'text-lg leading-7 text-muted-foreground',
  body: 'text-base leading-7 text-foreground',
  'body-sm': 'text-sm leading-6 text-muted-foreground',
  label: 'text-sm font-medium leading-none text-foreground',
  caption: 'text-xs leading-5 text-muted-foreground',
  code: 'text-sm font-mono leading-6 text-foreground',
} as const
