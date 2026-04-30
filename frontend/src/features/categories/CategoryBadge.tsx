import type { ReactElement } from 'react'
import { CATEGORY_ICON_COMPONENTS } from './categoryIconMap'
import type { CategoryIconName } from './designSystem'

interface CategoryBadgeProps {
  icon: CategoryIconName
  color: string
  size?: number
  label?: string
}

function contrastColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return 0.299 * r + 0.587 * g + 0.114 * b > 0.55 ? '#1f2a21' : '#ffffff'
}

export function CategoryBadge({ icon, color, size = 40, label }: CategoryBadgeProps): ReactElement {
  const IconComponent = CATEGORY_ICON_COMPONENTS[icon] ?? DefaultCategoryIcon
  const iconSize = Math.max(12, Math.round(size * 0.55))
  const iconColor = contrastColor(color)

  // PRD Story 8 (minimum icon render sizes) is still pending; the `size` prop allows tuning once the requirement is clarified.
  return (
    <div
      className="flex items-center justify-center rounded-full shadow-sm"
      style={{ backgroundColor: color, color: iconColor, width: size, height: size }}
      aria-label={label ?? 'Category icon'}
    >
      <IconComponent size={iconSize} />
    </div>
  )
}

function DefaultCategoryIcon({ size }: { size: number }): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      role="presentation"
      stroke="currentColor"
      fill="none"
      strokeWidth="1.75"
    >
      <circle cx="12" cy="12" r="6" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  )
}
