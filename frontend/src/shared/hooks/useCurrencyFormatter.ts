import { useMemo } from 'react'
import { formatCurrency } from '../lib/formatCurrency'

export function useCurrencyFormatter() {
  return useMemo(
    () => ({
      format: (amount: number) => formatCurrency(amount),
    }),
    [],
  )
}
