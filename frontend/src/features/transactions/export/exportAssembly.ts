import type { TransactionResponse } from '../../../app/store/api/transactionApi'
import type { FilterState, SortState } from '../types'
import { applyFilter, applySearch, applySort } from '../utils/pipelineUtils'

/**
 * ExportRow
 * Human-readable object representing a single row in the export file.
 * NOTE: Per PRD Instruction 1, this defines the confirmed field list.
 */
export interface ExportRow {
  Date: string // ISO 8601 (YYYY-MM-DD)
  Type: string // Resolved 'Income' or 'Expense'
  Amount: number // Plain numeric (no currency symbols)
  Description: string
  Category: string // Resolved category name
  'Payment Method': string // Resolved payment method name
}

export interface ExportAssemblyParams {
  transactions: TransactionResponse[]
  filterState?: FilterState
  searchQuery?: string
  sortState?: SortState
}

/**
 * Instruction 1: Export Data Assembly
 *
 * Queries the transaction store (provided as input) and assembles the export dataset
 * as an ordered, human-readable row collection, applying the confirmed field list
 * and resolving all foreign key references.
 *
 * @param params Transaction list and optional filter/search/sort criteria.
 * @returns An ordered array of ExportRow objects.
 */
export function assembleExportData({
  transactions,
  filterState,
  searchQuery = '',
  sortState = { criterion: 'date', direction: 'desc' },
}: ExportAssemblyParams): ExportRow[] {
  // 1. Stage 1: Pipeline Application
  // Reuse existing pipeline logic to ensure consistency with the UI.
  let processed = transactions
  if (filterState) {
    processed = applyFilter(processed, filterState)
  }
  if (searchQuery) {
    processed = applySearch(processed, searchQuery)
  }
  // Default sort for export is date desc (most recent first)
  processed = applySort(processed, sortState)

  // 2. Stage 2: Reconciliation Handling
  // PRD Open Question 5: Reconciliation entries excluded if unconfirmed.
  // FLAG: Reconciliation entries are excluded from export as per Instruction 1.
  const filteredForExport = processed.filter((tx) => tx.type !== 'RECONCILIATION')

  // 3. Stage 3: Field Mapping (Human-Readable)
  // PRD Open Question 3: Using five minimum fields + description (core field).
  // FLAG: Running balance per row is pending confirmation (Open Question 3).
  return filteredForExport.map((tx) => {
    // Resolve Foreign Keys to Human-Readable names
    const categoryName = tx.category?.name || 'Uncategorized'
    const paymentMethodName = tx.paymentMethod?.name || 'None'

    // Format Type Label
    const typeLabel = tx.type === 'INCOME' ? 'Income' : 'Expense'

    // Format Date (ISO 8601: YYYY-MM-DD)
    const formattedDate = new Date(tx.transactionDate).toISOString().split('T')[0]

    return {
      Date: formattedDate,
      Type: typeLabel,
      Amount: tx.amount,
      Description: tx.description || '',
      Category: categoryName,
      'Payment Method': paymentMethodName,
    }
  })
}
