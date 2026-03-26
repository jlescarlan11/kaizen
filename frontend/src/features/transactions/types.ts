import type { TransactionResponse, TransactionType } from '../../app/store/api/transactionApi'

export interface FilterState {
  categories: number[] // IDs of selected categories
  types: TransactionType[] // 'INCOME' or 'EXPENSE'
}

export type SortCriterion = 'date' | 'amount' | 'category'
export type SortDirection = 'asc' | 'desc'

export interface SortState {
  criterion: SortCriterion
  direction: SortDirection
}

export interface TransactionPipelineInput {
  transactions: TransactionResponse[]
  searchQuery: string
  filterState: FilterState
  sortState: SortState
}
