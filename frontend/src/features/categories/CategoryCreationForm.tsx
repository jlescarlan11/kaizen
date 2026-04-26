import type { FormEvent, ReactElement } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '../../shared/components/Button'
import { Input } from '../../shared/components/Input'
import { CategoryBadge } from './CategoryBadge'
import { CategoryColorPicker } from './CategoryColorPicker'
import { CategoryIconPicker } from './CategoryIconPicker'
import { createCategory, updateCategory } from './api'
import {
  getAutoAssignedCategoryDesign,
  isCategoryIconName,
  type CategoryIconName,
} from './designSystem'
import type { Category } from './types'
import { getErrorMessage } from '../../app/store/api/errors'

interface CategoryCreationFormProps {
  categories: Category[]
  onCategorySaved: (category: Category) => void
  initialCategory?: Category
  onCancel?: () => void
}

export function CategoryCreationForm({
  categories,
  onCategorySaved,
  initialCategory,
  onCancel,
}: CategoryCreationFormProps): ReactElement {
  const isEditMode = Boolean(initialCategory)
  const [name, setName] = useState(initialCategory?.name ?? '')
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
  const [selectedIcon, setSelectedIcon] = useState<CategoryIconName>(
    initialCategory?.icon && isCategoryIconName(initialCategory.icon)
      ? initialCategory.icon
      : assignedDesign.icon,
  )
  const [selectedColor, setSelectedColor] = useState(initialCategory?.color ?? assignedDesign.color)

  useEffect(() => {
    setName(initialCategory?.name ?? '')
    if (initialCategory?.icon && isCategoryIconName(initialCategory.icon)) {
      setSelectedIcon(initialCategory.icon)
    } else {
      setSelectedIcon(assignedDesign.icon)
    }
    setSelectedColor(initialCategory?.color ?? assignedDesign.color)
  }, [assignedDesign.color, assignedDesign.icon, initialCategory])

  const duplicateNameError = useMemo(() => {
    if (!trimmedName) {
      return null
    }

    const exists = categories.some(
      (category) =>
        category.id !== initialCategory?.id && category.name.toLowerCase() === normalizedName,
    )

    return exists ? 'That category name already exists. Choose a different name.' : null
  }, [categories, initialCategory?.id, normalizedName, trimmedName])

  const requiredNameError = trimmedName === '' ? 'Category name is required.' : null
  const fieldError = requiredNameError ?? duplicateNameError

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (fieldError) return

    setIsSubmitting(true)
    setServerError(null)

    try {
      const payload = {
        name: trimmedName,
        icon: selectedIcon,
        color: selectedColor,
      }
      const saved =
        isEditMode && initialCategory
          ? await updateCategory(initialCategory.id, payload)
          : await createCategory(payload)

      onCategorySaved(saved)
      if (!isEditMode) {
        setName('')
        setSelectedIcon(assignedDesign.icon)
        setSelectedColor(assignedDesign.color)
      }
    } catch (error) {
      console.error(`Category ${isEditMode ? 'update' : 'creation'} failed:`, error)
      setServerError(
        getErrorMessage(
          error,
          isEditMode
            ? 'Unable to update category. Please try again.'
            : 'Unable to save category. Please try again.',
        ),
      )
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
          helperText={
            isEditMode
              ? 'Changes apply only to your custom category.'
              : 'This name will only be visible to you.'
          }
          autoFocus
        />
      </div>

      <div className="rounded-2xl border border-ui-border-subtle bg-ui-surface-subtle/50 p-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-foreground uppercase tracking-tight">
            Icon & color
          </p>
          <span className="text-xs font-medium text-muted-foreground">Choose icon</span>
        </div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Pick an icon and color from the approved set.
        </p>
        <div className="mt-3">
          <CategoryIconPicker
            value={selectedIcon}
            color={selectedColor}
            onChange={setSelectedIcon}
          />
        </div>
        <div className="mt-3">
          <CategoryColorPicker value={selectedColor} onChange={setSelectedColor} />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <CategoryBadge
            icon={selectedIcon}
            color={selectedColor}
            size={48}
            label="Assigned category icon"
          />
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-medium text-foreground">
              {trimmedName || 'Custom category'}
            </span>
            <span className="text-xs text-muted-foreground">Color: {selectedColor}</span>
          </div>
        </div>
      </div>

      {serverError && (
        <p className="text-sm text-destructive" role="alert">
          {serverError}
        </p>
      )}

      <div className="flex justify-end gap-3">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button
          type="submit"
          isLoading={isSubmitting}
          disabled={Boolean(fieldError)}
          className="px-6"
        >
          {isEditMode ? 'Save changes' : 'Create category'}
        </Button>
      </div>
    </form>
  )
}
