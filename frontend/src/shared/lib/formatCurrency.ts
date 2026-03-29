/**
 * Formats a number as a currency string with a "PHP" prefix.
 * Standardizes formatting across the application.
 */
export function formatCurrency(
  amount: number,
  options: {
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  } = {},
): string {
  const formatter = new Intl.NumberFormat('en-PH', {
    style: 'decimal',
    minimumFractionDigits: options.minimumFractionDigits ?? 2,
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
  })

  return `PHP ${formatter.format(amount)}`
}

/**
 * Common currency formatters for use in components where performance is a concern
 * (to avoid creating new Intl.NumberFormat instances on every render)
 */
export const phpCurrencyFormatter = {
  format: (amount: number) => formatCurrency(amount),
  formatCompact: (amount: number) =>
    formatCurrency(amount, { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
}
