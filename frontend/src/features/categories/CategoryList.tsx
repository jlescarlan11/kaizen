import { Button } from '../../shared/components/Button'
import type { ReactElement } from 'react'
import { Card } from '../../shared/components/Card'
import { EmptyStateCard } from '../../shared/components/EmptyStateCard'
import { CategoryBadge } from './CategoryBadge'
import { isCategoryIconName } from './designSystem'
import type { Category } from './types'

interface CategoryListProps {
  categories: Category[]
  isLoading?: boolean
  onEdit?: (category: Category) => void
}

export function CategoryList({ categories, isLoading, onEdit }: CategoryListProps): ReactElement {
  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-16 animate-pulse bg-muted/50" />
        ))}
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <EmptyStateCard
        title="No categories yet"
        description="Add a custom category above to get started."
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
              <p className="truncate text-sm font-medium text-foreground">{category.name}</p>
              {category.isGlobal && <p className="text-xs text-muted-foreground">Default</p>}
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
