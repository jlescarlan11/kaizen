import { useMemo } from 'react'
import type { TransactionResponse } from '../../../app/store/api/transactionApi'
import type { FilterState, SortState } from '../types'
import { applyFilter, applySearch, applySort } from '../utils/pipelineUtils'

export interface TransactionPipelineParams {
  transactions: TransactionResponse[]
  searchQuery: string
  filterState: FilterState
  sortState: SortState
}

/**
 * useTransactionPipeline
 *
 * Shared Result Pipeline - Implementation of the composable data pipeline.
 * Sequence: filter → search → sort.
 */
export function useTransactionPipeline({
  transactions,
  searchQuery,
  filterState,
  sortState,
}: TransactionPipelineParams): TransactionResponse[] {
  return useMemo(() => {
    // Stage 1: Filter
    const filtered = applyFilter(transactions, filterState)

    // Stage 2: Search
    const searched = applySearch(filtered, searchQuery)

    // Stage 3: Sort
    const sorted = applySort(searched, sortState)

    return sorted
  }, [transactions, searchQuery, filterState, sortState])
}
