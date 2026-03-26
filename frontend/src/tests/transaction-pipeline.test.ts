import { describe, it, expect } from 'vitest'
import { applyFilter, applySearch, applySort } from '../features/transactions/utils/pipelineUtils'
import type { TransactionResponse } from '../app/store/api/transactionApi'
import type { FilterState, SortState } from '../features/transactions/types'

const MOCK_TRANSACTIONS: TransactionResponse[] = [
  {
    id: 1,
    amount: 100,
    type: 'EXPENSE',
    transactionDate: '2026-03-01T10:00:00Z',
    description: 'Groceries',
    category: { id: 1, name: 'Food', isGlobal: true, icon: '🛒', color: '#ff0000' },
  },
  {
    id: 2,
    amount: 200,
    type: 'INCOME',
    transactionDate: '2026-03-02T10:00:00Z',
    description: 'Salary',
    category: { id: 2, name: 'Work', isGlobal: true, icon: '💼', color: '#00ff00' },
  },
  {
    id: 3,
    amount: 50,
    type: 'EXPENSE',
    transactionDate: '2026-03-03T10:00:00Z',
    description: 'Coffee',
    category: { id: 1, name: 'Food', isGlobal: true, icon: '🛒', color: '#ff0000' },
  },
]

describe('Transaction Pipeline Utils', () => {
  describe('applyFilter', () => {
    it('filters by category', () => {
      const filter: FilterState = { categories: [1], types: [] }
      const result = applyFilter(MOCK_TRANSACTIONS, filter)
      expect(result).toHaveLength(2)
      expect(result.every((tx) => tx.category?.id === 1)).toBe(true)
    })

    it('filters by type', () => {
      const filter: FilterState = { categories: [], types: ['INCOME'] }
      const result = applyFilter(MOCK_TRANSACTIONS, filter)
      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('INCOME')
    })

    it('filters by both category and type', () => {
      const filter: FilterState = { categories: [1], types: ['EXPENSE'] }
      const result = applyFilter(MOCK_TRANSACTIONS, filter)
      expect(result).toHaveLength(2)
    })

    it('returns all when filter is empty', () => {
      const filter: FilterState = { categories: [], types: [] }
      const result = applyFilter(MOCK_TRANSACTIONS, filter)
      expect(result).toHaveLength(3)
    })
  })

  describe('applySearch', () => {
    it('searches by description', () => {
      const result = applySearch(MOCK_TRANSACTIONS, 'Groceries')
      expect(result).toHaveLength(1)
      expect(result[0].description).toBe('Groceries')
    })

    it('searches by category name', () => {
      const result = applySearch(MOCK_TRANSACTIONS, 'Work')
      expect(result).toHaveLength(1)
      expect(result[0].category?.name).toBe('Work')
    })

    it('searches by amount', () => {
      const result = applySearch(MOCK_TRANSACTIONS, '200')
      expect(result).toHaveLength(1)
      expect(result[0].amount).toBe(200)
    })

    it('is case-insensitive', () => {
      const result = applySearch(MOCK_TRANSACTIONS, 'groceries')
      expect(result).toHaveLength(1)
    })

    it('returns all when query is empty', () => {
      const result = applySearch(MOCK_TRANSACTIONS, '')
      expect(result).toHaveLength(3)
    })
  })

  describe('applySort', () => {
    it('sorts by date desc (default)', () => {
      const sort: SortState = { criterion: 'date', direction: 'desc' }
      const result = applySort(MOCK_TRANSACTIONS, sort)
      expect(result[0].id).toBe(3) // 2026-03-03
      expect(result[2].id).toBe(1) // 2026-03-01
    })

    it('sorts by amount asc', () => {
      const sort: SortState = { criterion: 'amount', direction: 'asc' }
      const result = applySort(MOCK_TRANSACTIONS, sort)
      expect(result[0].amount).toBe(50)
      expect(result[2].amount).toBe(200)
    })
  })
})
