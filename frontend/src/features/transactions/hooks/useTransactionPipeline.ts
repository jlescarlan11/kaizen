import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { TransactionResponse, TransactionFilters } from '../../../app/store/api/transactionApi'
import type { FilterState, SortState } from '../types'
import { applySort } from '../utils/pipelineUtils'
import { useTransactionPagination } from './useTransactionPagination'

export interface TransactionPipelineResult {
  transactions: TransactionResponse[]
  isLoading: boolean
  isError: boolean
  hasMore: boolean
  loadMore: () => Promise<void>
  isFetchingMore: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
  filterState: FilterState
  setFilterState: React.Dispatch<React.SetStateAction<FilterState>>
  clearFilters: () => void
  clearSearch: () => void
}

/**
 * useTransactionPipeline
 *
 * Shared Result Pipeline - Manages filter state and triggers backend fetch.
 * Sequence: backend filter/search → client-side sort.
 */
export function useTransactionPipeline(sortState: SortState): TransactionPipelineResult {
  const [searchParams, setSearchParams] = useSearchParams()

  // 1. State Management
  const [searchQuery, setSearchQuery] = useState('')
  const [filterState, setFilterState] = useState<FilterState>(() => {
    const categories = searchParams
      .getAll('category')
      .map(Number)
      .filter((id) => !isNaN(id))
    const paymentMethods = searchParams
      .getAll('paymentMethod')
      .map(Number)
      .filter((id) => !isNaN(id))
    const types = searchParams.getAll('type') as ('INCOME' | 'EXPENSE')[]
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    return {
      categories,
      paymentMethods,
      types: types.filter((t) => ['INCOME', 'EXPENSE'].includes(t)),
      startDate,
      endDate,
    }
  })

  // 2. Debounced Search (300ms)
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // 3. URL Synchronization
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams)
    newParams.delete('category')
    newParams.delete('type')
    newParams.delete('paymentMethod')
    newParams.delete('startDate')
    newParams.delete('endDate')

    filterState.categories.forEach((c) => newParams.append('category', String(c)))
    filterState.types.forEach((t) => newParams.append('type', t))
    filterState.paymentMethods.forEach((pm) => newParams.append('paymentMethod', String(pm)))

    if (filterState.startDate) newParams.set('startDate', filterState.startDate)
    if (filterState.endDate) newParams.set('endDate', filterState.endDate)

    setSearchParams(newParams, { replace: true })
  }, [filterState, setSearchParams])

  // 4. Backend Fetching (via useTransactionPagination)
  const apiFilters = useMemo<TransactionFilters>(() => ({
    search: debouncedSearch.trim() || undefined,
    categoryIds: filterState.categories.length > 0 ? filterState.categories : undefined,
    paymentMethodIds: filterState.paymentMethods.length > 0 ? filterState.paymentMethods : undefined,
    startDate: filterState.startDate,
    endDate: filterState.endDate,
    types: filterState.types.length > 0 ? filterState.types : undefined,
  }), [debouncedSearch, filterState])

  const {
    transactions,
    isLoading,
    isError,
    hasMore,
    loadMore,
    isFetchingMore,
  } = useTransactionPagination(apiFilters)

  // 5. Client-side Sorting
  const processedTransactions = useMemo(() => {
    return applySort(transactions, sortState)
  }, [transactions, sortState])

  const clearFilters = () => {
    setFilterState({
      categories: [],
      types: [],
      paymentMethods: [],
      startDate: undefined,
      endDate: undefined,
    })
  }

  const clearSearch = () => setSearchQuery('')

  return {
    transactions: processedTransactions,
    isLoading,
    isError,
    hasMore,
    loadMore,
    isFetchingMore,
    searchQuery,
    setSearchQuery,
    filterState,
    setFilterState,
    clearFilters,
    clearSearch,
  }
}
