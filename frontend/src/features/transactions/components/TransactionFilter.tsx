import type { ReactElement } from 'react'
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { Button } from '../../../shared/components/Button'
import { Checkbox } from '../../../shared/components/Checkbox'
import { useGetCategoriesQuery } from '../../../app/store/api/categoryApi'
import type { FilterState } from '../types'
import { cn } from '../../../shared/lib/cn'

interface TransactionFilterProps {
  filter: FilterState
  onChange: (filter: FilterState) => void
  onClear: () => void
}

export function TransactionFilter({
  filter,
  onChange,
  onClear,
}: TransactionFilterProps): ReactElement {
  const { data: categories = [] } = useGetCategoriesQuery()

  const hasActiveFilters = filter.categories.length > 0 || filter.types.length > 0

  const toggleCategory = (id: number) => {
    const newCategories = filter.categories.includes(id)
      ? filter.categories.filter((c) => c !== id)
      : [...filter.categories, id]
    onChange({ ...filter, categories: newCategories })
  }

  const toggleType = (type: 'INCOME' | 'EXPENSE') => {
    const newTypes = filter.types.includes(type)
      ? filter.types.filter((t) => t !== type)
      : [...filter.types, type]
    onChange({ ...filter, types: newTypes })
  }

  return (
    <Popover className="relative">
      <PopoverButton as={Fragment}>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            'flex items-center gap-2 h-10 px-4',
            hasActiveFilters && 'border-primary bg-primary/5 text-primary',
          )}
        >
          <FilterIcon />
          <span>Filter</span>
          {hasActiveFilters && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {filter.categories.length + filter.types.length}
            </span>
          )}
        </Button>
      </PopoverButton>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 translate-y-1"
        enterTo="opacity-100 translate-y-0"
        leave="transition ease-in duration-150"
        leaveFrom="opacity-100 translate-y-0"
        leaveTo="opacity-0 translate-y-1"
      >
        <PopoverPanel className="absolute left-0 z-50 mt-2 w-72 origin-top-left rounded-2xl border border-ui-border bg-ui-surface p-4 shadow-2xl focus:outline-none">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-foreground">Filters</h3>
              {hasActiveFilters && (
                <button
                  onClick={onClear}
                  className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Transaction Type Filter */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Transaction Type
              </p>
              <div className="grid grid-cols-2 gap-2">
                {(['INCOME', 'EXPENSE'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleType(type)}
                    className={cn(
                      'flex items-center justify-center rounded-lg border py-2 text-sm font-medium transition-all',
                      filter.types.includes(type)
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-ui-border-subtle bg-ui-surface-muted text-muted-foreground hover:border-ui-border',
                    )}
                  >
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Categories Filter */}
            <div className="space-y-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Categories
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                {categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-2 text-center italic">
                    No categories found
                  </p>
                ) : (
                  categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-ui-surface-muted transition-colors cursor-pointer group"
                      onClick={() => toggleCategory(category.id)}
                    >
                      <Checkbox
                        checked={filter.categories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-full text-xs"
                        style={{
                          backgroundColor: category.color + '22',
                          color: category.color,
                        }}
                      >
                        {category.icon}
                      </div>
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {category.name}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </PopoverPanel>
      </Transition>
    </Popover>
  )
}

function FilterIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  )
}
