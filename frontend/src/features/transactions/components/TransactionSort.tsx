import type { ReactElement } from 'react'
import { Select } from '../../../shared/components/Select'
import type { SortState, SortCriterion, SortDirection } from '../types'

interface TransactionSortProps {
  sort: SortState
  onChange: (sort: SortState) => void
}

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Date: Newest First' },
  { value: 'date-asc', label: 'Date: Oldest First' },
  { value: 'amount-desc', label: 'Amount: Highest First' },
  { value: 'amount-asc', label: 'Amount: Lowest First' },
  { value: 'category-asc', label: 'Category: A-Z' },
  { value: 'category-desc', label: 'Category: Z-A' },
]

export function TransactionSort({ sort, onChange }: TransactionSortProps): ReactElement {
  const currentValue = `${sort.criterion}-${sort.direction}`

  const handleValueChange = (value: string) => {
    const [criterion, direction] = value.split('-') as [SortCriterion, SortDirection]
    onChange({ criterion, direction })
  }

  return (
    <div className="w-full max-w-[240px]">
      <Select
        options={SORT_OPTIONS}
        value={currentValue}
        onChange={handleValueChange}
        className="h-10"
      />
    </div>
  )
}
