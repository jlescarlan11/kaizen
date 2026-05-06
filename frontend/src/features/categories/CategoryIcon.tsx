import type { ReactElement } from 'react'
import { CATEGORY_ICON_COMPONENTS } from './categoryIconMap'
import type { CategoryIconName } from './designSystem'
import { cn } from '../../shared/lib/cn'

export interface CategoryIconProps {
  icon: string | null | undefined
  color?: string
  size?: number
  className?: string
  variant?: 'solid' | 'subtle' | 'none'
  label?: string
}

function contrastColor(hex: string): string {
  if (!hex || hex === 'transparent') return 'currentColor'
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return 0.299 * r + 0.587 * g + 0.114 * b > 0.55 ? '#1f2a21' : '#ffffff'
}

export function CategoryIcon({
  icon,
  color,
  size = 20,
  className,
  variant = 'none',
  label,
}: CategoryIconProps): ReactElement {
  const iconName = (icon as CategoryIconName) || 'home'
  const IconComponent = CATEGORY_ICON_COMPONENTS[iconName] ?? DefaultCategoryIcon
  const iconSize = variant === 'none' ? size : Math.round(size * 0.6)

  const baseStyles = 'flex items-center justify-center rounded-full shrink-0'

  if (variant === 'solid' && color) {
    const iconColor = contrastColor(color)
    return (
      <div
        className={cn(baseStyles, 'shadow-sm', className)}
        style={{ backgroundColor: color, color: iconColor, width: size, height: size }}
        aria-label={label ?? 'Category icon'}
      >
        <IconComponent size={iconSize} />
      </div>
    )
  }

  if (variant === 'subtle' && color) {
    return (
      <div
        className={cn(baseStyles, className)}
        style={{ backgroundColor: color + '22', color: color, width: size, height: size }}
        aria-label={label ?? 'Category icon'}
      >
        <IconComponent size={iconSize} />
      </div>
    )
  }

  return (
    <div
      className={cn('flex items-center justify-center shrink-0', className)}
      style={{ color: color, width: size, height: size }}
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
