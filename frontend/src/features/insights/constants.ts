import type { PeriodOption } from './types'

export const PERIOD_LABELS: Record<PeriodOption, string> = {
  CURRENT_MONTH: 'This Month',
  LAST_MONTH: 'Last Month',
  LAST_3_MONTHS: 'Last 3 Months',
  ALL_TIME: 'All Time',
  YTD: 'Year to Date',
  LAST_12_MONTHS: 'Last 12 Months',
  CUSTOM: 'Custom Range',
}

export const getPeriodRange = (preset: PeriodOption): { start: string; end: string } => {
  const now = new Date()
  const start = new Date()
  const end = new Date()

  switch (preset) {
    case 'CURRENT_MONTH':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      break
    case 'LAST_MONTH':
      start.setMonth(now.getMonth() - 1)
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setDate(0)
      end.setHours(23, 59, 59, 999)
      break
    case 'LAST_3_MONTHS':
      start.setMonth(now.getMonth() - 2)
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      break
    case 'YTD':
      start.setMonth(0)
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      break
    case 'LAST_12_MONTHS':
      start.setFullYear(now.getFullYear() - 1)
      start.setHours(0, 0, 0, 0)
      break
    case 'ALL_TIME':
      start.setFullYear(2000) // Fallback to a very old date
      break
    case 'CUSTOM':
      // Handled by user input
      break
  }

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}
