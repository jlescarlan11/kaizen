import { useCallback, useEffect, useState, type ReactElement } from 'react'
import { Card } from '../../shared/components/Card'
import { ResponsiveModal } from '../../shared/components/ResponsiveModal'
import { Button } from '../../shared/components/Button'
import { CategoryCreationForm } from './CategoryCreationForm'
import { CategoryList } from './CategoryList'
import { MergeCategoriesModal } from './MergeCategoriesModal'
import { getCategories } from './api'
import type { Category } from './types'
import { pageLayout } from '../../shared/styles/layout'

export function CategoryManagementPage(): ReactElement {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false)

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

  const handleCategoryUpdated = (updatedCategory: Category) => {
    setCategories((prev) =>
      prev.map((category) => (category.id === updatedCategory.id ? updatedCategory : category)),
    )
    setEditingCategory(null)
  }

  return (
    <section className={pageLayout.sectionGap}>
      <header className={pageLayout.headerGap}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              Category Management
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Create categories tailored to your workflow. They will appear immediately anywhere you
              pick a category.
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => setIsMergeModalOpen(true)}
          >
            Merge Categories
          </Button>
        </div>
      </header>

      {error && (
        <Card variant="warning">
          <p className="text-sm text-foreground">{error}</p>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
        <Card className="space-y-4">
          <h3 className="text-lg md:text-xl font-semibold tracking-tight text-foreground">
            Add a custom category
          </h3>
          <CategoryCreationForm categories={categories} onCategorySaved={handleCategoryCreated} />
        </Card>

        <Card className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg md:text-xl font-semibold tracking-tight text-foreground">
              Your categories
            </h3>
            <p className="text-xs uppercase text-subtle-foreground">Automatic refresh</p>
          </div>
          <CategoryList
            categories={categories}
            isLoading={isLoading}
            onEdit={(category) => setEditingCategory(category)}
          />
        </Card>
      </div>

      <ResponsiveModal
        open={editingCategory !== null}
        title={editingCategory ? `Edit ${editingCategory.name}` : 'Edit category'}
        onClose={() => setEditingCategory(null)}
      >
        {editingCategory ? (
          <CategoryCreationForm
            categories={categories}
            initialCategory={editingCategory}
            onCategorySaved={handleCategoryUpdated}
            onCancel={() => setEditingCategory(null)}
          />
        ) : null}
      </ResponsiveModal>

      <MergeCategoriesModal open={isMergeModalOpen} onClose={() => setIsMergeModalOpen(false)} />
    </section>
  )
}
