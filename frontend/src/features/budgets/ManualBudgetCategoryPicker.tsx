import type { ReactElement } from 'react'
import { useMemo } from 'react'
import { Select } from '../../shared/components/Select'
import { SharedIcon } from '../../shared/components/IconRegistry'
import { cn } from '../../shared/lib/cn'
import type { Category } from '../categories/types'

export const CUSTOM_CATEGORY_OPTION_VALUE = '__custom__'

interface ManualBudgetCategoryPickerProps {
  categories: Category[]
  value: number | '' | typeof CUSTOM_CATEGORY_OPTION_VALUE
  disabledIds: number[]
  loading?: boolean
  error?: string | null
  className?: string
  onChange: (categoryId: number | '' | typeof CUSTOM_CATEGORY_OPTION_VALUE) => void
}

export function ManualBudgetCategoryPicker({
  categories,
  value,
  disabledIds,
  loading = false,
  error,
  className,
  onChange,
}: ManualBudgetCategoryPickerProps): ReactElement {
  const options = useMemo(() => {
    return [
      ...[...categories]
        .sort((first, second) => first.name.localeCompare(second.name))
        .map((category) => ({
          value: String(category.id),
          label: disabledIds.includes(category.id)
            ? `${category.name} (already added)`
            : category.name,
          disabled: disabledIds.includes(category.id),
          icon: <SharedIcon type="category" name={category.icon} size={18} />,
        })),
      {
        value: CUSTOM_CATEGORY_OPTION_VALUE,
        label: 'Custom category',
        icon: <SharedIcon type="category" name="sparkles" size={18} />,
      },
    ]
  }, [categories, disabledIds])

  const helperText = loading
    ? 'Loading categories...'
    : 'Categories selected during this session become unavailable until you finish or close this screen.'

  return (
    <Select
      id="manual-category-picker"
      label="Category"
      options={options}
      value={value === '' ? '' : String(value)}
      onChange={(selectedValue) =>
        onChange(
          selectedValue === ''
            ? ''
            : selectedValue === CUSTOM_CATEGORY_OPTION_VALUE
              ? CUSTOM_CATEGORY_OPTION_VALUE
              : Number(selectedValue),
        )
      }
      helperText={helperText}
      error={error ?? undefined}
      placeholder={loading ? 'Loading categories...' : 'Select a category'}
      className={cn(loading ? 'animate-pulse' : undefined, className)}
      name="manual-category-picker"
    />
  )
}
