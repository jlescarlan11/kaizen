import type { TransactionResponse } from '../../../app/store/api/transactionApi'

export interface TransactionGroup {
  date: string
  transactions: TransactionResponse[]
}

export interface MoneyFlowMetrics {
  incoming: number
  outgoing: number
  ratio: number
}

/**
 * Calculates incoming and outgoing money flow metrics from a set of transactions.
 * @param transactions Array of TransactionResponse objects.
 * @returns MoneyFlowMetrics object.
 */
export function calculateMoneyFlow(transactions: TransactionResponse[]): MoneyFlowMetrics {
  const metrics = transactions.reduce(
    (acc, tx) => {
      if (tx.type === 'INCOME') {
        acc.incoming += tx.amount
      } else if (tx.type === 'EXPENSE') {
        acc.outgoing += tx.amount
      }
      return acc
    },
    { incoming: 0, outgoing: 0 },
  )

  const ratio =
    metrics.incoming === 0 ? (metrics.outgoing > 0 ? 1 : 0) : metrics.outgoing / metrics.incoming

  return {
    ...metrics,
    ratio,
  }
}

/**
 * Groups a flat array of transactions by their calendar date (most-recent first).
 * @param transactions Array of TransactionResponse objects.
 * @returns An ordered array of TransactionGroup objects.
 */
export function groupTransactionsByDate(transactions: TransactionResponse[]): TransactionGroup[] {
  // Sort transactions by date descending (most recent first)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime(),
  )

  const groupMap = new Map<string, TransactionResponse[]>()

  for (const tx of sortedTransactions) {
    const d = new Date(tx.transactionDate)
    const calendarDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    const existingGroup = groupMap.get(calendarDate) || []
    groupMap.set(calendarDate, [...existingGroup, tx])
  }

  return Array.from(groupMap.entries()).map(([date, txs]) => ({
    date,
    transactions: txs,
  }))
}

/**
 * Formats a transaction date based on whether it is today or not.
 * If today: show time (short)
 * If not today: show date (short)
 */
export function formatTransactionDate(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)

  if (targetDate.getTime() === today.getTime()) {
    return new Intl.DateTimeFormat('en-PH', {
      timeStyle: 'short',
    }).format(date)
  }

  return new Intl.DateTimeFormat('en-PH', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

/**
 * Formats a raw calendar date string (YYYY-MM-DD) into a human-readable label.
 * NOTE: Implements "Today", "Yesterday", and "Month DD, YYYY" per PRD Instruction 3 constraints.
 * @param dateStr Raw calendar date string.
 * @returns Human-readable date label.
 */
export function formatGroupDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const targetDate = new Date(year, month - 1, day)
  targetDate.setHours(0, 0, 0, 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (targetDate.getTime() === today.getTime()) {
    return 'Today'
  }

  if (targetDate.getTime() === yesterday.getTime()) {
    return 'Yesterday'
  }

  return new Intl.DateTimeFormat('en-PH', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(targetDate)
}

/**
 * Calculates the total running balance from a set of transactions.
 * @param transactions Array of TransactionResponse objects.
 * @returns Total balance (Income - Expense).
 */
export function calculateRunningBalance(transactions: TransactionResponse[]): number {
  return transactions.reduce((acc, tx) => {
    if (tx.type === 'INCOME') return acc + tx.amount
    if (tx.type === 'EXPENSE') return acc - tx.amount
    return acc
  }, 0)
}

/**
 * Formats a frequency unit and multiplier into a human-readable string.
 * @param unit Frequency unit (DAILY, WEEKLY, MONTHLY, YEARLY).
 * @param multiplier Frequency multiplier.
 * @returns Human-readable frequency string.
 */
export function formatFrequency(unit?: string, multiplier?: number): string {
  if (!unit || !multiplier) return '—'

  const unitLabels: Record<string, string> = {
    DAILY: 'day',
    WEEKLY: 'week',
    MONTHLY: 'month',
    YEARLY: 'year',
  }

  const label = unitLabels[unit] || unit.toLowerCase()

  if (multiplier === 1) {
    switch (unit) {
      case 'DAILY':
        return 'Daily'
      case 'WEEKLY':
        return 'Weekly'
      case 'MONTHLY':
        return 'Monthly'
      case 'YEARLY':
        return 'Yearly'
      default:
        return unit.charAt(0).toUpperCase() + unit.slice(1).toLowerCase()
    }
  }

  return `Every ${multiplier} ${label}s`
}
