import { useState, useMemo } from 'react'
import type { PeriodOption } from '../types'

const VALID_PERIODS: PeriodOption[] = ['CURRENT_MONTH', 'LAST_3_MONTHS', 'YTD']

export function useInsightsPeriod() {
  const [period, setPeriod] = useState<PeriodOption>(() => {
    const saved = localStorage.getItem('insights_period')
    return VALID_PERIODS.includes(saved as PeriodOption) ? (saved as PeriodOption) : 'CURRENT_MONTH'
  })

  const dateRange = useMemo(() => {
    const now = new Date()
    let start: Date
    const end = new Date()
    end.setHours(23, 59, 59, 999)

    switch (period) {
      case 'LAST_3_MONTHS':
        start = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        break
      case 'YTD':
        start = new Date(now.getFullYear(), 0, 1)
        break
      case 'CURRENT_MONTH':
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    return {
      start: start.toISOString(),
      end: end.toISOString(),
    }
  }, [period])

  const updatePeriod = (newPeriod: PeriodOption) => {
    setPeriod(newPeriod)
    localStorage.setItem('insights_period', newPeriod)
  }

  return { period, dateRange, updatePeriod }
}
