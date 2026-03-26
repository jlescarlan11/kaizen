import type { TransactionResponse } from '../../../app/store/api/transactionApi'

export interface TransactionGroup {
  date: string
  transactions: TransactionResponse[]
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
    const calendarDate = new Date(tx.transactionDate).toISOString().split('T')[0]
    const existingGroup = groupMap.get(calendarDate) || []
    groupMap.set(calendarDate, [...existingGroup, tx])
  }

  return Array.from(groupMap.entries()).map(([date, txs]) => ({
    date,
    transactions: txs,
  }))
}

/**
 * Formats a raw calendar date string (YYYY-MM-DD) into a human-readable label.
 * NOTE: Implements "Today", "Yesterday", and "Month DD, YYYY" per PRD Instruction 3 constraints.
 * @param dateStr Raw calendar date string.
 * @returns Human-readable date label.
 */
export function formatGroupDate(dateStr: string): string {
  const date = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  const targetDate = new Date(date)
  targetDate.setHours(0, 0, 0, 0)

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
  }).format(date)
}

/**
 * Calculates the total running balance from a set of transactions.
 * @param transactions Array of TransactionResponse objects.
 * @returns Total balance (Income - Expense + Reconciliation).
 */
export function calculateRunningBalance(transactions: TransactionResponse[]): number {
  return transactions.reduce((acc, tx) => {
    if (tx.type === 'INCOME') return acc + tx.amount
    if (tx.type === 'EXPENSE') return acc - tx.amount
    if (tx.type === 'RECONCILIATION') {
      return tx.reconciliationIncrease ? acc + tx.amount : acc - tx.amount
    }
    return acc
  }, 0)
}
