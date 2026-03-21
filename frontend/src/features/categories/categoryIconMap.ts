import type { ReactElement } from 'react'
import type { CategoryIconName } from './designSystem'
import { BoltIcon, CarIcon, FilmIcon, HeartbeatIcon, HomeIcon, UtensilsIcon } from './categoryIcons'

type IconRenderer = (props: { size: number }) => ReactElement

export const CATEGORY_ICON_COMPONENTS: Record<CategoryIconName, IconRenderer> = {
  home: HomeIcon,
  utensils: UtensilsIcon,
  car: CarIcon,
  bolt: BoltIcon,
  heartbeat: HeartbeatIcon,
  film: FilmIcon,
}
