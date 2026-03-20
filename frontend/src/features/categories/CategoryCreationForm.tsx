import type { FormEvent, ReactElement } from 'react'
import { useMemo, useState } from 'react'
import { Button } from '../../shared/components/Button'
import { Input } from '../../shared/components/Input'
import { createCategory } from './api'
import type { Category } from './types'

const DEFAULT_ICON = 'custom'
const DEFAULT_COLOR = '#4a90e2'

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
        icon: DEFAULT_ICON,
        color: DEFAULT_COLOR,
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
          <span className="text-xs font-medium text-muted-foreground">Future system</span>
        </div>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Colors and icons are assigned by Instruction 8's palette picker. The placeholder below
          simply keeps the form valid until that picker ships.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ui-border-subtle text-lg text-foreground"
            style={{ backgroundColor: DEFAULT_COLOR }}
          >
            ★
          </div>
          <div className="flex flex-1 flex-col">
            <span className="text-sm font-medium text-foreground">Icon: {DEFAULT_ICON}</span>
            <span className="text-xs text-muted-foreground">Color: {DEFAULT_COLOR}</span>
          </div>
        </div>
        {/* Integration stub: wire Instruction 8's icon/color picker into this panel once the system is ready. */}
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
