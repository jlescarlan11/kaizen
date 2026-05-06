import type { ReactElement } from 'react'
import type { CategoryIconName } from './designSystem'
import { CategoryIcon } from './CategoryIcon'

interface CategoryBadgeProps {
  icon: CategoryIconName
  color: string
  size?: number
  label?: string
}

export function CategoryBadge({ icon, color, size = 40, label }: CategoryBadgeProps): ReactElement {
  return <CategoryIcon icon={icon} color={color} size={size} variant="solid" label={label} />
}
