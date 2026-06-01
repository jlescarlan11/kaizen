import { useCallback, useEffect, useState, type ReactElement } from 'react'
import { Card } from '../../shared/components/Card'
import { ResponsiveModal } from '../../shared/components/ResponsiveModal'
import { Button } from '../../shared/components/Button'
import { PageHeader } from '../../shared/components/PageHeader'
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
    <div className="w-full">
      <section className={pageLayout.sectionGap}>
        <PageHeader
          title="Categories"
          subtitle="Create categories tailored to your workflow. They will appear immediately anywhere you pick a category."
          actions={
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => setIsMergeModalOpen(true)}
            >
              Merge Categories
            </Button>
          }
        />

        {error && (
          <Card variant="warning">
            <p className="text-sm text-text-primary">{error}</p>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr]">
          <Card className="space-y-4">
            <h3 className="text-lg md:text-xl font-semibold tracking-tight text-text-primary">
              Add a custom category
            </h3>
            <CategoryCreationForm categories={categories} onCategorySaved={handleCategoryCreated} />
          </Card>

          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg md:text-xl font-semibold tracking-tight text-text-primary">
                Your categories
              </h3>
              <p className="text-xs uppercase text-text-secondary">Automatic refresh</p>
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
    </div>
  )
}
