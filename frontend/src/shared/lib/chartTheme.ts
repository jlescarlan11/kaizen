/**
 * Theme-aware chart palette. Each entry is a CSS variable reference.
 * Recharts and SVG accept var() in fill/stroke props in modern browsers.
 *
 * Categorical: rotate through this list for series-of-N (pie slices,
 * stacked bars, multi-line charts). Order is chosen for perceptual
 * separation across light + dark themes.
 */
export const CHART_PALETTE = [
  'var(--color-primary)',
  'var(--color-ui-success)',
  'var(--color-ui-warning)',
  'var(--color-ui-info)',
  'var(--color-ui-danger)',
  'var(--color-primary-light)',
  'var(--color-primary-dark)',
] as const

/**
 * Single-series semantic colors. Use these for charts that have ONE
 * series with a clear semantic meaning, so the chart stays readable
 * without consulting a legend.
 */
export const CHART_COLORS = {
  primary: 'var(--color-primary)',
  income: 'var(--color-income)',
  expense: 'var(--color-expense)',
  success: 'var(--color-ui-success)',
  warning: 'var(--color-ui-warning)',
  danger: 'var(--color-ui-danger)',
  info: 'var(--color-ui-info)',
  textPrimary: 'var(--color-text-primary)',
  borderStrong: 'var(--color-border-strong)',
} as const

/**
 * Pick the i-th categorical color, wrapping with modulo. Use for charts
 * that cycle through series colors:
 *
 *   <Cell fill={getCategoricalColor(index)} />
 */
export function getCategoricalColor(index: number): string {
  return CHART_PALETTE[index % CHART_PALETTE.length]
}
