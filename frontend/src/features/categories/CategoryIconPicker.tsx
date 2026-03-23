import type { ReactElement } from 'react'
import { cn } from '../../shared/lib/cn'
import { CATEGORY_ICON_LABELS, CATEGORY_ICON_SEQUENCE, type CategoryIconName } from './designSystem'
import { CategoryBadge } from './CategoryBadge'

interface CategoryIconPickerProps {
  value: CategoryIconName
  color: string
  onChange: (icon: CategoryIconName) => void
}

export function CategoryIconPicker({
  value,
  color,
  onChange,
}: CategoryIconPickerProps): ReactElement {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        {CATEGORY_ICON_SEQUENCE.map((icon) => {
          const isSelected = icon === value

          return (
            <button
              key={icon}
              type="button"
              onClick={() => onChange(icon)}
              aria-pressed={isSelected}
              aria-label={`${CATEGORY_ICON_LABELS[icon]} icon option`}
              title={CATEGORY_ICON_LABELS[icon]}
              className={cn(
                'flex h-12 items-center justify-center rounded-xl border transition-colors',
                isSelected
                  ? 'border-ui-border-strong bg-ui-surface text-foreground'
                  : 'border-ui-border-subtle bg-ui-surface-subtle text-muted-foreground hover:border-ui-border hover:bg-ui-surface',
              )}
            >
              <CategoryBadge
                icon={icon}
                color={color}
                size={32}
                label={`${CATEGORY_ICON_LABELS[icon]} icon option`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
