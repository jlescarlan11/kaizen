import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  calculateMoneyFlow,
  groupTransactionsByDate,
  formatGroupDate,
  calculateRunningBalance,
  formatFrequency,
} from '../transactionUtils'
import type { TransactionResponse } from '../../../../app/store/api/transactionApi'

const MOCK_TRANSACTIONS: TransactionResponse[] = [
  {
    id: 1,
    amount: 100,
    type: 'EXPENSE',
    transactionDate: '2026-03-01T10:00:00Z',
    description: 'Coffee',
  },
  {
    id: 2,
    amount: 500,
    type: 'INCOME',
    transactionDate: '2026-03-02T10:00:00Z',
    description: 'Freelance work',
  },
  {
    id: 3,
    amount: 50,
    type: 'RECONCILIATION',
    transactionDate: '2026-03-03T10:00:00Z',
    description: 'Correction',
    reconciliationIncrease: true,
  },
  {
    id: 4,
    amount: 30,
    type: 'RECONCILIATION',
    transactionDate: '2026-03-04T10:00:00Z',
    description: 'Correction',
    reconciliationIncrease: false,
  },
  {
    id: 5,
    amount: 1000,
    type: 'INITIAL_BALANCE',
    transactionDate: '2026-03-01T00:00:00Z',
    description: 'Starting point',
  },
]

describe('transactionUtils', () => {
  describe('calculateMoneyFlow', () => {
    it('calculates incoming and outgoing correctly', () => {
      const result = calculateMoneyFlow(MOCK_TRANSACTIONS)
      // incoming: 500 (INCOME) + 50 (RECONCILIATION INCREASE) + 1000 (INITIAL_BALANCE) = 1550
      // outgoing: 100 (EXPENSE) + 30 (RECONCILIATION DECREASE) = 130
      expect(result.incoming).toBe(1550)
      expect(result.outgoing).toBe(130)
    })

    it('calculates ratio correctly (spending-to-income)', () => {
      const result = calculateMoneyFlow(MOCK_TRANSACTIONS)
      // 130 / 1550 = 0.08387...
      expect(result.ratio).toBeCloseTo(0.0839, 4)
    })

    it('handles empty list', () => {
      const result = calculateMoneyFlow([])
      expect(result.incoming).toBe(0)
      expect(result.outgoing).toBe(0)
      expect(result.ratio).toBe(0)
    })

    it('handles only income', () => {
      const result = calculateMoneyFlow([MOCK_TRANSACTIONS[1]])
      expect(result.incoming).toBe(500)
      expect(result.outgoing).toBe(0)
      expect(result.ratio).toBe(0)
    })

    it('handles only expenses', () => {
      const result = calculateMoneyFlow([MOCK_TRANSACTIONS[0]])
      expect(result.incoming).toBe(0)
      expect(result.outgoing).toBe(100)
      expect(result.ratio).toBe(1) // Should be 1 (fully spending) if no income?
    })

    it('handles cases where outgoing > incoming', () => {
      const txs: TransactionResponse[] = [
        {
          id: 1,
          amount: 100,
          type: 'INCOME',
          transactionDate: '2026-01-01T00:00:00Z',
          description: 'x',
        },
        {
          id: 2,
          amount: 200,
          type: 'EXPENSE',
          transactionDate: '2026-01-01T00:00:00Z',
          description: 'y',
        },
      ]
      const result = calculateMoneyFlow(txs)
      // 200 / 100 = 2
      expect(result.ratio).toBe(2)
    })
  })

  describe('groupTransactionsByDate', () => {
    it('groups transactions by calendar date and sorts them descending', () => {
      const txs: TransactionResponse[] = [
        {
          id: 1,
          amount: 10,
          type: 'EXPENSE',
          transactionDate: '2026-03-01T10:00:00Z',
          description: 'a',
        },
        {
          id: 2,
          amount: 20,
          type: 'EXPENSE',
          transactionDate: '2026-03-01T15:00:00Z',
          description: 'b',
        },
        {
          id: 3,
          amount: 30,
          type: 'EXPENSE',
          transactionDate: '2026-03-02T10:00:00Z',
          description: 'c',
        },
      ]

      const groups = groupTransactionsByDate(txs)
      expect(groups).toHaveLength(2)
      expect(groups[0].date).toBe('2026-03-02')
      expect(groups[0].transactions).toHaveLength(1)
      expect(groups[1].date).toBe('2026-03-01')
      expect(groups[1].transactions).toHaveLength(2)
    })
  })

  describe('formatGroupDate', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      // Set "today" to March 15, 2026
      vi.setSystemTime(new Date('2026-03-15T12:00:00Z'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('returns "Today" for today\'s date', () => {
      expect(formatGroupDate('2026-03-15')).toBe('Today')
    })

    it('returns "Yesterday" for yesterday\'s date', () => {
      expect(formatGroupDate('2026-03-14')).toBe('Yesterday')
    })

    it('returns a formatted date for other dates', () => {
      const formatted = formatGroupDate('2026-03-13')
      expect(formatted).toMatch(/March 13, 2026/)
    })
  })

  describe('calculateRunningBalance', () => {
    it('calculates correctly based on INCOME, EXPENSE and RECONCILIATION', () => {
      const balance = calculateRunningBalance(MOCK_TRANSACTIONS)
      // 500 (income) - 100 (expense) + 50 (rec inc) - 30 (rec dec) = 420
      expect(balance).toBe(420)
    })
  })

  describe('formatFrequency', () => {
    it('returns "-" for missing unit or multiplier', () => {
      expect(formatFrequency()).toBe('—')
      expect(formatFrequency('DAILY')).toBe('—')
    })

    it('formats singular frequencies correctly', () => {
      expect(formatFrequency('DAILY', 1)).toBe('Daily')
      expect(formatFrequency('WEEKLY', 1)).toBe('Weekly')
      expect(formatFrequency('MONTHLY', 1)).toBe('Monthly')
      expect(formatFrequency('YEARLY', 1)).toBe('Yearly')
    })

    it('formats plural frequencies correctly', () => {
      expect(formatFrequency('DAILY', 2)).toBe('Every 2 days')
      expect(formatFrequency('WEEKLY', 3)).toBe('Every 3 weeks')
      expect(formatFrequency('MONTHLY', 6)).toBe('Every 6 months')
    })

    it('handles custom units correctly', () => {
      expect(formatFrequency('CUSTOM', 1)).toBe('Custom')
      expect(formatFrequency('CUSTOM', 2)).toBe('Every 2 customs')
    })
  })
})
