import type { FilterState } from '../types'
import type { CategoryResponse } from '../../../app/store/api/categoryApi'
import type { PaymentMethod } from '../../payment-methods/types'

/**
 * Instruction 8: Export Filter Metadata
 *
 * Implements the recording of applied filter criteria in the exported file
 * (filename suffix or in-file metadata) to make the export self-documenting.
 *
 * NOTE: PRD Open Question 7 (recording location) unconfirmed; implementing
 * both filename suffix and metadata row capability.
 */

/**
 * Constructs a human-readable summary of the active filter state.
 * Suitable for inclusion in a filename or as a metadata row.
 */
export function constructFilterMetadata(
  filterState: FilterState,
  searchQuery: string,
  categories: CategoryResponse[],
  paymentMethods: PaymentMethod[],
): string {
  const parts: string[] = []

  // 1. Search Criteria
  if (searchQuery.trim()) {
    parts.push(`Search: "${searchQuery.trim()}"`)
  }

  // 2. Transaction Types
  if (filterState.types.length > 0) {
    parts.push(`Types: ${filterState.types.join(', ')}`)
  }

  // 3. Categories
  if (filterState.categories.length > 0) {
    const categoryNames = filterState.categories
      .map((id) => categories.find((c) => c.id === id)?.name || `ID:${id}`)
      .join(', ')
    parts.push(`Categories: ${categoryNames}`)
  }

  // 4. Payment Methods
  if (filterState.paymentMethods.length > 0) {
    const pmNames = filterState.paymentMethods
      .map((id) => paymentMethods.find((pm) => pm.id === id)?.name || `ID:${id}`)
      .join(', ')
    parts.push(`Accounts: ${pmNames}`)
  }

  return parts.length > 0 ? parts.join(' | ') : 'All Transactions'
}

/**
 * Generates a concise filename-safe suffix for the filter criteria.
 * e.g., 'category-food_income'
 */
export function generateFilenameSuffix(filterState: FilterState, searchQuery: string): string {
  const parts: string[] = []

  if (searchQuery.trim()) {
    parts.push('searched')
  }

  if (filterState.types.length > 0) {
    parts.push(filterState.types.join('-').toLowerCase())
  }

  if (filterState.categories.length > 0) {
    parts.push(`filtered-cats`)
  }

  return parts.length > 0 ? `_${parts.join('_')}` : ''
}
