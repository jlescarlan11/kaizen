import type { CSSProperties, ReactElement } from 'react'
import { cn } from '../../shared/lib/cn'
import { CATEGORY_COLOR_PALETTE } from './designSystem'

interface CategoryColorPickerProps {
  value: string
  onChange: (color: string) => void
}

export function CategoryColorPicker({ value, onChange }: CategoryColorPickerProps): ReactElement {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
      {CATEGORY_COLOR_PALETTE.map((color) => {
        const isSelected = color === value

        return (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            aria-pressed={isSelected}
            aria-label={`Choose color ${color}`}
            title={color}
            className={cn(
              'flex h-10 items-center justify-center rounded-xl border transition-colors',
              isSelected
                ? 'border-ui-border-strong bg-ui-surface'
                : 'border-ui-border-subtle bg-ui-surface-subtle hover:border-ui-border hover:bg-ui-surface',
            )}
          >
            <span
              className="block h-5 w-5 rounded-full border border-black/10 [background-color:var(--swatch-color)]"
              style={{ '--swatch-color': color } as CSSProperties}
            />
          </button>
        )
      })}
    </div>
  )
}
