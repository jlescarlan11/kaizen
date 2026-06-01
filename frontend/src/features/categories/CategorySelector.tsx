import { type ReactElement, useMemo } from 'react'
import { useGetCategoriesQuery } from '../../app/store/api/categoryApi'
import { Select, type SelectOption } from '../../shared/components/Select'
import { cn } from '../../shared/lib/cn'
import { type TransactionType } from '../../app/store/api/transactionApi'
import { CategoryIcon } from './CategoryIcon'

interface CategorySelectorProps {
  value?: string | null
  onChange: (value: string | null) => void
  label?: string
  error?: string
  helperText?: string
  placeholder?: string
  className?: string
  id?: string
  type?: TransactionType
}

export function CategorySelector({
  value,
  onChange,
  label = 'Category (Optional)',
  error,
  helperText,
  placeholder = 'Select a category',
  className,
  id,
  type,
}: CategorySelectorProps): ReactElement {
  const { data: categories = [], isLoading } = useGetCategoriesQuery()

  const filteredCategories = useMemo(() => {
    if (!type) return categories
    return categories.filter((cat) => cat.type === type)
  }, [categories, type])

  const categoryOptions: SelectOption[] = useMemo(
    () => [
      // Null option (Uncategorized)
      {
        value: '',
        label: 'None (Uncategorized)',
        icon: (
          <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-surface-secondary text-text-secondary text-3xs font-black italic">
            —
          </div>
        ),
      },
      ...filteredCategories.map((cat) => ({
        value: cat.id.toString(),
        label: cat.name,
        icon: <CategoryIcon icon={cat.icon} color={cat.color} variant="subtle" size={20} />,
      })),
    ],
    [filteredCategories],
  )

  const handleChange = (newValue: string) => {
    // If empty string (None), emit null
    onChange(newValue === '' ? null : newValue)
  }

  return (
    <Select
      id={id}
      label={label}
      options={categoryOptions}
      value={value ?? ''}
      onChange={handleChange}
      error={error}
      helperText={helperText}
      placeholder={placeholder}
      className={cn(className)}
      disabled={isLoading}
    />
  )
}
