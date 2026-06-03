import { useState, type ReactElement } from 'react'
import { Card } from '../../shared/components/Card'
import { ResponsiveModal } from '../../shared/components/ResponsiveModal'
import { Button } from '../../shared/components/Button'
import { CategoryCreationForm } from './CategoryCreationForm'
import { CategoryList } from './CategoryList'
import { MergeCategoriesModal } from './MergeCategoriesModal'
import { useGetCategoriesQuery } from '../../app/store/api/categoryApi'
import type { Category } from './types'
import { pageLayout } from '../../shared/styles/layout'
import { typography } from '../../shared/styles/typography'

export function CategoryManagementPage(): ReactElement {
  const { data: categories = [], isLoading, error } = useGetCategoriesQuery()
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isMergeModalOpen, setIsMergeModalOpen] = useState(false)

  const handleCategoryCreated = () => {
    // RTK Query invalidates 'Categories' tag on create — list auto-refreshes.
  }

  const handleCategoryUpdated = () => {
    // RTK Query invalidates 'Categories' tag on update — list auto-refreshes.
    setEditingCategory(null)
  }

  return (
    <div className="w-full">
      <section className={pageLayout.sectionGap}>
        <h1 className={typography.h1}>Categories</h1>

        {error && (
          <Card variant="error" role="alert">
            <p className="text-sm text-text-primary">Unable to load categories at this time.</p>
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
              <Button
                variant="outline"
                className="shrink-0"
                onClick={() => setIsMergeModalOpen(true)}
              >
                Merge Categories
              </Button>
            </div>
            <CategoryList
              categories={categories}
              isLoading={isLoading}
              onEdit={(category) => setEditingCategory(category)}
              onAddCategory={() => {
                const el = document.getElementById('category-name')
                el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                el?.focus()
              }}
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
