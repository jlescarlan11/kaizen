import { useCallback, useEffect, useState, type ReactElement } from 'react'
import { Card } from '../../shared/components/Card'
import { CategoryCreationForm } from './CategoryCreationForm'
import { CategoryList } from './CategoryList'
import { getCategories } from './api'
import type { Category } from './types'

export function CategoryManagementPage(): ReactElement {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadCategories = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const fetched = await getCategories()
      setCategories(fetched)
    } catch {
      setError('Unable to load categories at this time.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadCategories()
  }, [loadCategories])

  const handleCategoryCreated = (category: Category) => {
    setCategories((prev) => [category, ...prev])
  }

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Category management
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Create categories tailored to your workflow. They will appear immediately anywhere you
          pick a category, alongside the defaults you already know.
        </p>
      </header>

      {error && (
        <Card tone="warning">
          <p className="text-sm text-foreground">{error}</p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        <Card className="space-y-4">
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Add a custom category
          </h2>
          <CategoryCreationForm categories={categories} onCategoryCreated={handleCategoryCreated} />
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              Your categories
            </h2>
            <p className="text-xs uppercase text-subtle-foreground">Automatic refresh</p>
          </div>
          <CategoryList categories={categories} isLoading={isLoading} />
        </Card>
      </div>
    </section>
  )
}
