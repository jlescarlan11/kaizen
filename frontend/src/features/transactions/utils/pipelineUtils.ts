import type { TransactionResponse } from '../../../app/store/api/transactionApi'
import type { SortState } from '../types'

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
