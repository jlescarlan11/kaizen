import { Button } from '../../shared/components/Button'
import type { ReactElement } from 'react'
import { Card } from '../../shared/components/Card'
import { CardSkeleton } from '../../shared/components'
import { EmptyStateCard } from '../../shared/components/EmptyStateCard'
import { SharedIcon } from '../../shared/components/IconRegistry'
import { CategoryBadge } from './CategoryBadge'
import { isCategoryIconName } from './designSystem'
import type { Category } from './types'

interface CategoryListProps {
  categories: Category[]
  isLoading?: boolean
  onEdit?: (category: Category) => void
  onAddCategory?: () => void
}

export function CategoryList({
  categories,
  isLoading,
  onEdit,
  onAddCategory,
}: CategoryListProps): ReactElement {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <CardSkeleton key={i} className="flex items-center gap-3 p-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-surface-secondary" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-3/4 rounded bg-surface-secondary" />
              <div className="h-2 w-1/2 rounded bg-surface-secondary" />
            </div>
          </CardSkeleton>
        ))}
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <EmptyStateCard
        icon={<SharedIcon type="ui" name="wallet" size={24} />}
        title="No custom categories yet"
        description="Create a custom category using the form on the left."
        primaryAction={{ label: 'Add a category', onClick: () => onAddCategory?.() }}
      />
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {categories.map((category) => {
        const iconName = isCategoryIconName(category.icon) ? category.icon : 'home'
        return (
          <Card key={category.id} className="flex items-center gap-3 p-3">
            <CategoryBadge
              icon={iconName}
              color={category.color}
              size={40}
              label={`Icon for ${category.name}`}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text-primary">{category.name}</p>
              {category.isGlobal && <p className="text-xs text-text-secondary">Default</p>}
            </div>
            {!category.isGlobal && onEdit ? (
              <Button
                type="button"
                variant="ghost"
                className="h-8 px-3 text-xs"
                onClick={() => onEdit(category)}
              >
                Edit
              </Button>
            ) : null}
          </Card>
        )
      })}
    </div>
  )
}
