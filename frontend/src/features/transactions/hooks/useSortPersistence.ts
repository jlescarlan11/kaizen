import { useState, useEffect } from 'react'
import type { SortState } from '../types'

const SORT_STORAGE_KEY = 'kaizen-transaction-sort'

const DEFAULT_SORT: SortState = {
  criterion: 'date',
  direction: 'desc',
}

/**
 * useSortPersistence
 *
 * Implement the mechanism that preserves the selected sort criterion and direction.
 */
export function useSortPersistence() {
  const [sort, setSort] = useState<SortState>(() => {
    const stored = localStorage.getItem(SORT_STORAGE_KEY)
    if (stored) {
      try {
        return JSON.parse(stored) as SortState
      } catch (e) {
        console.error('Failed to parse stored sort state', e)
      }
    }
    return DEFAULT_SORT
  })

  useEffect(() => {
    localStorage.setItem(SORT_STORAGE_KEY, JSON.stringify(sort))
  }, [sort])

  return [sort, setSort] as const
}
