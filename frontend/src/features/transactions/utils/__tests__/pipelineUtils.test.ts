import { describe, it, expect } from 'vitest'
import { applyFilter, applySearch } from '../pipelineUtils'
import type { TransactionResponse } from '../../../../app/store/api/transactionApi'
import type { FilterState } from '../../types'

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
]

describe('pipelineUtils', () => {
  describe('applyFilter', () => {
    it('returns all transactions when filter is empty', () => {
      const filter: FilterState = {
        categories: [],
        types: [],
      }
      const result = applyFilter(MOCK_TRANSACTIONS, filter)
      expect(result).toHaveLength(2)
    })

    it('filters by type correctly', () => {
      const filter: FilterState = {
        categories: [],
        types: ['INCOME'],
      }
      const result = applyFilter(MOCK_TRANSACTIONS, filter)
      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('INCOME')
    })

    it('includes EXPENSE when filtered by EXPENSE', () => {
      const filter: FilterState = {
        categories: [],
        types: ['EXPENSE'],
      }
      const result = applyFilter(MOCK_TRANSACTIONS, filter)
      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('EXPENSE')
    })
  })

  describe('applySearch', () => {
    it('does not crash when a transaction has no category', () => {
      const txs: TransactionResponse[] = [
        ...MOCK_TRANSACTIONS,
        {
          id: 3,
          amount: 1000,
          type: 'INITIAL_BALANCE',
          transactionDate: '2026-03-01T00:00:00Z',
          description: 'Starting',
        },
      ]
      const result = applySearch(txs, 'Starting')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(3)
    })

    it('filters by category name', () => {
      const txs: TransactionResponse[] = [
        {
          id: 1,
          amount: 100,
          type: 'EXPENSE',
          transactionDate: '2026-03-01T10:00:00Z',
          description: 'Lunch',
          category: {
            id: 1,
            name: 'Food',
            global: true,
            icon: 'utensils',
            color: '#FF0000',
            type: 'EXPENSE',
          },
        },
      ]
      const result = applySearch(txs, 'food')
      expect(result).toHaveLength(1)
    })

    it('filters by description', () => {
      const result = applySearch(MOCK_TRANSACTIONS, 'coffee')
      expect(result).toHaveLength(1)
      expect(result[0].description).toBe('Coffee')
    })
  })
})
