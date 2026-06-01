import { type LucideIcon } from 'lucide-react'
import { PAYMENT_METHOD_ICONS, UI_ICONS } from './IconConstants'
import { CategoryIcon } from '../../features/categories/CategoryIcon'

export type IconType = 'category' | 'payment' | 'ui'

interface SharedIconProps {
  type: IconType
  name: string
  size?: number
  className?: string
  color?: string
  strokeWidth?: number
}

export function SharedIcon({
  type,
  name,
  size = 18,
  className,
  color,
  strokeWidth = 2,
}: SharedIconProps) {
  if (type === 'category') {
    return <CategoryIcon icon={name} size={size} className={className} color={color} />
  }

  let IconComponent: LucideIcon | undefined

  if (type === 'payment') {
    IconComponent = PAYMENT_METHOD_ICONS[name]
  } else if (type === 'ui') {
    IconComponent = UI_ICONS[name]
  }

  if (!IconComponent) {
    return null
  }

  return <IconComponent size={size} className={className} strokeWidth={strokeWidth} />
}
