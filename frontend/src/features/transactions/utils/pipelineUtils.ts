import type { TransactionResponse } from '../../../app/store/api/transactionApi'
import type { FilterState, SortState } from '../types'

/**
 * Filter stage of the pipeline.
 * Narrow the transaction list to records matching all selected filter criteria simultaneously.
 */
export function applyFilter(
  transactions: TransactionResponse[],
  filter: FilterState,
): TransactionResponse[] {
  const { categories, types, paymentMethods } = filter

  if (categories.length === 0 && types.length === 0 && paymentMethods.length === 0) {
    return transactions
  }

  return transactions.filter((tx) => {
    // Category match
    const categoryMatch =
      categories.length === 0 || (tx.category && categories.includes(tx.category.id))
    // Type match
    const typeMatch = types.length === 0 || types.includes(tx.type)
    // Payment method match
    const paymentMethodMatch =
      paymentMethods.length === 0 || (tx.paymentMethod && paymentMethods.includes(tx.paymentMethod.id))

    return categoryMatch && typeMatch && paymentMethodMatch
  })
}

/**
 * Search stage of the pipeline.
 * Narrow the transaction list to records whose searchable fields match the entered query.
 * Searchable fields: description, amount, category.
 */
export function applySearch(
  transactions: TransactionResponse[],
  query: string,
): TransactionResponse[] {
  if (!query.trim()) {
    return transactions
  }

  const normalizedQuery = query.toLowerCase().trim()

  return transactions.filter((tx) => {
    const descriptionMatch = tx.description?.toLowerCase()?.includes(normalizedQuery)
    const categoryMatch = tx.category?.name?.toLowerCase()?.includes(normalizedQuery)
    const amountMatch = tx.amount.toString().includes(normalizedQuery)

    return !!(descriptionMatch || categoryMatch || amountMatch)
  })
}

/**
 * Sort stage of the pipeline.
 * Reorder the current result set by the selected criterion and direction.
 */
export function applySort(
  transactions: TransactionResponse[],
  sort: SortState,
): TransactionResponse[] {
  const { criterion, direction } = sort
  const isAsc = direction === 'asc'

  return [...transactions].sort((a, b) => {
    let comparison = 0

    switch (criterion) {
      case 'date':
        comparison = new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime()
        break
      case 'amount':
        comparison = a.amount - b.amount
        break
      case 'category': {
        const nameA = a.category?.name || ''
        const nameB = b.category?.name || ''
        comparison = nameA.localeCompare(nameB)
        break
      }
      default:
        comparison = 0
    }

    return isAsc ? comparison : -comparison
  })
}
