import type { FormEvent, ReactElement } from 'react'
import { useMemo, useState } from 'react'
import { Button } from '../../shared/components/Button'
import { Input } from '../../shared/components/Input'
import { CategoryBadge } from './CategoryBadge'
import { createCategory } from './api'
import { getAutoAssignedCategoryDesign } from './designSystem'
import type { Category } from './types'

interface CategoryCreationFormProps {
  categories: Category[]
  onCategoryCreated: (category: Category) => void
}

export function CategoryCreationForm({
  categories,
  onCategoryCreated,
}: CategoryCreationFormProps): ReactElement {
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const trimmedName = name.trim()
  const normalizedName = trimmedName.toLowerCase()

  const userScopedCategories = useMemo(
    () => categories.filter((category) => !category.isGlobal),
    [categories],
  )

  const assignedDesign = useMemo(
    () => getAutoAssignedCategoryDesign(userScopedCategories),
    [userScopedCategories],
  )

  const duplicateNameError = useMemo(() => {
    if (!trimmedName) {
      return null
    }

    // Inferred (PRD Story 7): duplicate checks should be case-insensitive and scoped to the user's own categories.
    const exists = userScopedCategories.some(
      (category) => category.name.toLowerCase() === normalizedName,
    )

    return exists ? 'You already created a category with that name.' : null
  }, [normalizedName, trimmedName, userScopedCategories])

  const requiredNameError = trimmedName === '' ? 'Category name is required.' : null
  const fieldError = requiredNameError ?? duplicateNameError

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (fieldError) return

    setIsSubmitting(true)
    setServerError(null)

    try {
      const created = await createCategory({
        name: trimmedName,
        icon: assignedDesign.icon,
        color: assignedDesign.color,
      })

      onCategoryCreated(created)
      setName('')
    } catch (error) {
      console.error('Category creation failed:', error)
      setServerError('Unable to save category. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-2">
        <Input
          id="category-name"
          label="Category name"
          placeholder="e.g. Groceries"
          value={name}
          onChange={(event) => setName(event.target.value)}
          error={fieldError ?? undefined}
          helperText="This name will only be visible to you."
          autoFocus
        />
      </div>

      <div className="rounded-2xl border border-ui-border-subtle bg-ui-surface-subtle/50 p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground uppercase tracking-tight">
            Icon & color
          </p>
          <span className="text-xs font-medium text-muted-foreground">Automated</span>
        </div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Instruction 8 defines the icon and color palette applied to every category. The preview
          below shows what will be stored for this new category.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <CategoryBadge
            icon={assignedDesign.icon}
            color={assignedDesign.color}
            size={48}
            label="Assigned category icon"
          />
          <div className="flex flex-1 flex-col text-xs uppercase tracking-tight">
            <span className="text-sm font-medium text-foreground">Icon: {assignedDesign.icon}</span>
            <span className="text-muted-foreground">Color: {assignedDesign.color}</span>
          </div>
        </div>
        {/* Instruction 8 auto-assigns the values shown above. Replace this stub with the picker once
            the author confirms custom icon/color selection (PRD Open Question 6). */}
      </div>

      {serverError && (
        <p className="text-sm text-destructive" role="alert">
          {serverError}
        </p>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={Boolean(fieldError)}
          className="px-6"
        >
          Create category
        </Button>
      </div>
    </form>
  )
}
