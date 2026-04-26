import type { ReactElement } from 'react'
import { Popover, PopoverButton, PopoverPanel, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { Button } from '../../../shared/components/Button'
import { Checkbox } from '../../../shared/components/Checkbox'
import { useGetCategoriesQuery } from '../../../app/store/api/categoryApi'
import { useGetPaymentMethodsQuery } from '../../../app/store/api/paymentMethodApi'
import type { FilterState } from '../types'
import { cn } from '../../../shared/lib/cn'
import { SharedIcon } from '../../../shared/components/IconRegistry'

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
  const { data: paymentMethods = [] } = useGetPaymentMethodsQuery()

  const hasActiveFilters =
    filter.categories.length > 0 ||
    filter.types.length > 0 ||
    filter.paymentMethods.length > 0 ||
    !!filter.startDate ||
    !!filter.endDate

  const toggleCategory = (id: number) => {
    const newCategories = filter.categories.includes(id)
      ? filter.categories.filter((c) => c !== id)
      : [...filter.categories, id]
    onChange({ ...filter, categories: newCategories })
  }

  const togglePaymentMethod = (id: number) => {
    const newPaymentMethods = filter.paymentMethods.includes(id)
      ? filter.paymentMethods.filter((pm) => pm !== id)
      : [...filter.paymentMethods, id]
    onChange({ ...filter, paymentMethods: newPaymentMethods })
  }

  const toggleType = (type: 'INCOME' | 'EXPENSE') => {
    const newTypes = filter.types.includes(type)
      ? filter.types.filter((t) => t !== type)
      : [...filter.types, type]
    onChange({ ...filter, types: newTypes })
  }

  const setDateRange = (startDate?: string, endDate?: string) => {
    onChange({ ...filter, startDate, endDate })
  }

  const applyPreset = (preset: '7d' | '30d' | 'month' | 'all') => {
    const end = new Date()
    const start = new Date()

    switch (preset) {
      case '7d':
        start.setDate(end.getDate() - 7)
        setDateRange(start.toISOString().split('T')[0], end.toISOString().split('T')[0])
        break
      case '30d':
        start.setDate(end.getDate() - 30)
        setDateRange(start.toISOString().split('T')[0], end.toISOString().split('T')[0])
        break
      case 'month':
        start.setDate(1)
        setDateRange(start.toISOString().split('T')[0], end.toISOString().split('T')[0])
        break
      case 'all':
        setDateRange(undefined, undefined)
        break
    }
  }

  return (
    <Popover className="relative">
      {({ open }) => (
        <>
          <PopoverButton as={Fragment}>
            <Button
              variant="outline"
              size="sm"
              className={cn(
                'flex items-center gap-2 h-10 px-4',
                hasActiveFilters && 'border-primary bg-primary/5 text-primary',
              )}
            >
              <SharedIcon type="ui" name="filter" size={18} />
              <span>Filter</span>
              {hasActiveFilters && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
                  {filter.categories.length +
                    filter.types.length +
                    filter.paymentMethods.length +
                    (filter.startDate || filter.endDate ? 1 : 0)}
                </span>
              )}
            </Button>
          </PopoverButton>

          <Transition
            show={open}
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
          >
            <PopoverPanel className="absolute right-0 z-50 mt-2 w-80 origin-top-right rounded-2xl border border-ui-border bg-ui-surface p-4 shadow-2xl focus:outline-none">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Filters</h3>
                  {hasActiveFilters && (
                    <button
                      onClick={onClear}
                      className="text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {/* Date Range Presets */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Date Range
                  </p>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none -mx-1 px-1">
                    {[
                      { label: '7 Days', value: '7d' as const },
                      { label: '30 Days', value: '30d' as const },
                      { label: 'Month', value: 'month' as const },
                      { label: 'Clear', value: 'all' as const },
                    ].map((preset) => (
                      <button
                        key={preset.value}
                        onClick={() => applyPreset(preset.value)}
                        className="flex-none flex items-center justify-center rounded-lg border border-ui-border-subtle bg-ui-surface-muted px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:border-ui-border transition-all whitespace-nowrap"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom Date Inputs */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                        From
                      </label>
                      <input
                        type="date"
                        value={filter.startDate || ''}
                        onChange={(e) => setDateRange(e.target.value || undefined, filter.endDate)}
                        className="w-full bg-ui-surface-muted border border-ui-border-subtle rounded-lg px-2 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide ml-1">
                        To
                      </label>
                      <input
                        type="date"
                        value={filter.endDate || ''}
                        onChange={(e) =>
                          setDateRange(filter.startDate, e.target.value || undefined)
                        }
                        className="w-full bg-ui-surface-muted border border-ui-border-subtle rounded-lg px-2 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:border-primary transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Transaction Type Filter */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
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
                        {type === 'INCOME' ? 'Income' : 'Expense'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Categories Filter */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Categories
                  </p>
                  <div className="max-h-40 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
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
                            className="flex h-6 w-6 items-center justify-center rounded-full"
                            style={{
                              backgroundColor: category.color + '22',
                              color: category.color,
                            }}
                          >
                            <SharedIcon type="category" name={category.icon} size={14} />
                          </div>
                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {category.name}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Payment Methods Filter */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Payment Methods
                  </p>
                  <div className="max-h-40 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                    {paymentMethods.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2 text-center italic">
                        No payment methods found
                      </p>
                    ) : (
                      paymentMethods.map((pm) => (
                        <div
                          key={pm.id}
                          className="flex items-center gap-3 p-2 rounded-lg hover:bg-ui-surface-muted transition-colors cursor-pointer group"
                          onClick={() => togglePaymentMethod(pm.id)}
                        >
                          <Checkbox
                            checked={filter.paymentMethods.includes(pm.id)}
                            onCheckedChange={() => togglePaymentMethod(pm.id)}
                          />
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-ui-surface-muted text-foreground font-semibold text-xs">
                            {pm.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                            {pm.name}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </PopoverPanel>
          </Transition>
        </>
      )}
    </Popover>
  )
}
