import { type LucideIcon } from 'lucide-react'
import { CATEGORY_ICONS, PAYMENT_METHOD_ICONS, UI_ICONS } from './IconConstants'

export type IconType = 'category' | 'payment' | 'ui'

interface SharedIconProps {
  type: IconType
  name: string
  size?: number
  className?: string
}

export function SharedIcon({ type, name, size = 18, className }: SharedIconProps) {
  let IconComponent: LucideIcon | undefined

  if (type === 'category') {
    IconComponent = CATEGORY_ICONS[name]
  } else if (type === 'payment') {
    IconComponent = PAYMENT_METHOD_ICONS[name]
  } else if (type === 'ui') {
    IconComponent = UI_ICONS[name]
  }

  if (!IconComponent) {
    return null
  }

  return <IconComponent size={size} className={className} />
}
