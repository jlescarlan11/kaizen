import type { ChangeEvent, ReactElement } from 'react'
import { useMemo } from 'react'
import { cn } from '../../shared/lib/cn'
import type { Category } from '../categories/types'
import { formFieldClasses } from '../../shared/styles/form'

interface ManualBudgetCategoryPickerProps {
  categories: Category[]
  value: number | ''
  disabledIds: number[]
  loading?: boolean
  disabled?: boolean
  error?: string | null
  onChange: (categoryId: number | '') => void
}

export function ManualBudgetCategoryPicker({
  categories,
  value,
  disabledIds,
  loading = false,
  disabled = false,
  error,
  onChange,
}: ManualBudgetCategoryPickerProps): ReactElement {
  const options = useMemo(() => {
    return [...categories].sort((first, second) => first.name.localeCompare(second.name))
  }, [categories])

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const rawValue = event.target.value
    if (!rawValue) {
      onChange('')
      return
    }
    onChange(Number(rawValue))
  }

  const helperText = loading
    ? 'Loading categories…'
    : 'Categories selected during this session become unavailable until you finish or close this screen.'

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor="manual-category-picker" className={formFieldClasses.label}>
        Category
      </label>
      <div className="relative">
        <select
          id="manual-category-picker"
          value={value === '' ? '' : String(value)}
          onChange={handleSelectChange}
          disabled={disabled || loading}
          className={cn(
            formFieldClasses.input,
            disabled && 'cursor-not-allowed opacity-70',
            loading && 'animate-pulse',
          )}
        >
          <option value="" disabled>
            {loading ? 'Loading categories…' : 'Select a category'}
          </option>
          {options.map((category) => {
            const isDisabled = disabledIds.includes(category.id)
            return (
              <option key={category.id} value={category.id} disabled={isDisabled}>
                {category.name}
                {isDisabled ? ' (already added)' : ''}
              </option>
            )
          })}
        </select>
      </div>
      <p className="text-xs leading-5 text-muted-foreground">{helperText}</p>
      {error ? (
        <p className={formFieldClasses.error} aria-live="assertive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
