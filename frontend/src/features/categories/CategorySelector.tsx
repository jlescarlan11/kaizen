import { type ReactElement } from 'react'
import { useGetCategoriesQuery } from '../../../app/store/api/categoryApi'
import { Select, type SelectOption } from '../../../shared/components/Select'
import { cn } from '../../../shared/lib/cn'

interface CategorySelectorProps {
  value?: string | null
  onChange: (value: string | null) => void
  label?: string
  error?: string
  helperText?: string
  placeholder?: string
  className?: string
  id?: string
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
}: CategorySelectorProps): ReactElement {
  const { data: categories = [], isLoading } = useGetCategoriesQuery()

  const categoryOptions: SelectOption[] = [
    // Null option (Uncategorized)
    {
      value: '',
      label: 'None (Uncategorized)',
      icon: (
        <div className="flex h-5 w-5 items-center justify-center rounded-full bg-ui-surface-muted text-muted-foreground text-[10px]">
          —
        </div>
      ),
    },
    ...categories.map((cat) => ({
      value: cat.id.toString(),
      label: cat.name,
      icon: (
        <div
          className="flex h-5 w-5 items-center justify-center rounded-full text-[12px]"
          style={{
            backgroundColor: cat.color + '22',
            color: cat.color,
          }}
        >
          {cat.icon}
        </div>
      ),
    })),
  ]

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
