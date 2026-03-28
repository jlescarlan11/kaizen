import { useLayoutEffect, useRef, useState, type ReactElement } from 'react'
import { Input } from '../../shared/components/Input'
import { ResponsiveModal } from '../../shared/components/ResponsiveModal'
import { Button } from '../../shared/components/Button'
import { CategoryBadge } from './CategoryBadge'
import { CategoryColorPicker } from './CategoryColorPicker'
import { CategoryIconPicker } from './CategoryIconPicker'
import type { CategoryIconName } from './designSystem'
import { CATEGORY_ICON_LABELS } from './designSystem'
import { formFieldClasses } from '../../shared/styles/form'

interface InlineCustomCategoryFieldsProps {
  name: string
  icon: CategoryIconName
  color: string
  nameError?: string
  serverError?: string
  onNameChange: (value: string) => void
  onIconChange: (icon: CategoryIconName) => void
  onColorChange: (color: string) => void
}

export function InlineCustomCategoryFields({
  name,
  icon,
  color,
  nameError,
  serverError,
  onNameChange,
  onIconChange,
  onColorChange,
}: InlineCustomCategoryFieldsProps): ReactElement {
  const [isModalOpen, setIsModalOpen] = useState(false)
  // Staged state - only committed on "Done"
  const [stagedIcon, setStagedIcon] = useState<CategoryIconName>(icon)
  const [stagedColor, setStagedColor] = useState(color)

  const previewRef = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = previewRef.current
    if (!el) return
    el.style.setProperty('--preview-bg', `${stagedColor}14`)
    el.style.setProperty('--preview-color', stagedColor)
  }, [stagedColor])

  const openModal = (): void => {
    setStagedIcon(icon)
    setStagedColor(color)
    setIsModalOpen(true)
  }

  const handleConfirm = (): void => {
    onIconChange(stagedIcon)
    onColorChange(stagedColor)
    setIsModalOpen(false)
  }

  const handleClose = (): void => {
    setStagedIcon(icon)
    setStagedColor(color)
    setIsModalOpen(false)
  }

  return (
    <>
      <div className="space-y-2">
        <label htmlFor="custom-category-name" className={formFieldClasses.label}>
          Category name
        </label>

        <Input
          id="custom-category-name"
          placeholder="e.g. Weekend Trips"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          error={nameError}
          startAdornmentPointerEvents="auto"
          startAdornment={
            <button
              type="button"
              onClick={openModal}
              aria-label={`Change icon and color — currently ${CATEGORY_ICON_LABELS[icon]}`}
              className="relative flex h-8 w-8 items-center justify-center rounded-full border border-ui-border-subtle bg-ui-surface text-ui-text transition hover:border-ui-border hover:bg-ui-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ui-focus"
            >
              <CategoryBadge icon={icon} color={color} size={28} label="Selected icon" />
              <span className="absolute -right-0.5 -bottom-0.5 flex h-3 w-3 items-center justify-center rounded-full border border-ui-border bg-ui-surface-muted text-[9px]">
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="text-subtle-foreground"
                >
                  <path d="M21 2v6h-6" />
                  <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
                  <path d="M3 22v-6h6" />
                  <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
                </svg>
              </span>
            </button>
          }
          className="pl-14"
        />

        {serverError ? (
          <p className="text-sm text-ui-danger-text-soft" role="alert">
            {serverError}
          </p>
        ) : null}
      </div>

      <ResponsiveModal
        title="Icon & color"
        open={isModalOpen}
        onClose={handleClose}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>Done</Button>
          </div>
        }
      >
        <div className="space-y-5">
          {/* Live mini-preview inside modal */}
          <div
            ref={previewRef}
            className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors duration-200 bg-(--preview-bg)"
          >
            <CategoryBadge icon={stagedIcon} color={stagedColor} size={40} label="Preview" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-(--preview-color)">
                {name.trim() || 'Custom category'}
              </p>
            </div>
          </div>

          {/* Icon grid */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-ui-text">Icon</p>
            <CategoryIconPicker value={stagedIcon} color={stagedColor} onChange={setStagedIcon} />
          </div>

          {/* Color swatches */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-ui-text">Color</p>
            <CategoryColorPicker value={stagedColor} onChange={setStagedColor} />
          </div>
        </div>
      </ResponsiveModal>
    </>
  )
}
