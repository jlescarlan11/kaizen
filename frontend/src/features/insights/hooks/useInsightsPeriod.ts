import { useState, useMemo } from 'react'
import type { PeriodOption } from '../types'

export function useInsightsPeriod() {
  const [period, setPeriod] = useState<PeriodOption>(() => {
    const saved = localStorage.getItem('insights_period')
    return (saved as PeriodOption) || 'CURRENT_MONTH'
  })

  const dateRange = useMemo(() => {
    const now = new Date()
    let start: Date
    let end: Date = new Date() // default to now
    end.setHours(23, 59, 59, 999)

    switch (period) {
      case 'CURRENT_MONTH':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'LAST_MONTH':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        end = new Date(now.getFullYear(), now.getMonth(), 0)
        end.setHours(23, 59, 59, 999)
        break
      case 'LAST_3_MONTHS':
        start = new Date(now.getFullYear(), now.getMonth() - 3, 1)
        break
      case 'ALL_TIME':
        start = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
        break
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
