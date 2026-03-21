import type { ReactElement } from 'react'
import { CATEGORY_ICON_COMPONENTS } from './categoryIconMap'
import type { CategoryIconName } from './designSystem'

interface CategoryBadgeProps {
  icon: CategoryIconName
  color: string
  size?: number
  label?: string
}

export function CategoryBadge({ icon, color, size = 40, label }: CategoryBadgeProps): ReactElement {
  const IconComponent = CATEGORY_ICON_COMPONENTS[icon] ?? DefaultCategoryIcon
  const iconSize = Math.max(12, Math.round(size * 0.55))

  // PRD Story 8 (minimum icon render sizes) is still pending; the `size` prop allows tuning once the requirement is clarified.
  return (
    <div
      className="flex items-center justify-center rounded-full text-white shadow-sm"
      style={{ backgroundColor: color, width: size, height: size }}
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
