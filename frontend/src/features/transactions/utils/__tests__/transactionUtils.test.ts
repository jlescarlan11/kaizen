import { describe, it, expect } from 'vitest'
import { calculateMoneyFlow } from '../transactionUtils'
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
})
