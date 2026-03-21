import type { ReactElement } from 'react'
import { Card } from '../../shared/components/Card'
import { CategoryBadge } from './CategoryBadge'
import { isCategoryIconName } from './designSystem'
import type { Category } from './types'

interface CategoryListProps {
  categories: Category[]
  isLoading?: boolean
}

export function CategoryList({ categories, isLoading }: CategoryListProps): ReactElement {
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
      <Card className="flex h-32 items-center justify-center border-dashed">
        <p className="text-sm text-muted-foreground">No categories found.</p>
      </Card>
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
          </Card>
        )
      })}
    </div>
  )
}
