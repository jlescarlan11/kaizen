import type { ReactElement } from 'react'
import type { CategoryIconName } from './designSystem'
import {
  BanknoteIcon,
  BoltIcon,
  BookIcon,
  CarIcon,
  CreditCardIcon,
  DumbbellIcon,
  FilmIcon,
  GiftIcon,
  HeartbeatIcon,
  HomeIcon,
  LaptopIcon,
  PawPrintIcon,
  PlaneIcon,
  ReceiptIcon,
  ShieldIcon,
  ShoppingBagIcon,
  SparklesIcon,
  UsersIcon,
  UtensilsIcon,
  WalletIcon,
} from './categoryIcons'

type IconRenderer = (props: { size: number }) => ReactElement

export const CATEGORY_ICON_COMPONENTS: Record<CategoryIconName, IconRenderer> = {
  home: HomeIcon,
  utensils: UtensilsIcon,
  car: CarIcon,
  bolt: BoltIcon,
  heartbeat: HeartbeatIcon,
  film: FilmIcon,
  book: BookIcon,
  wallet: WalletIcon,
  receipt: ReceiptIcon,
  'credit-card': CreditCardIcon,
  'shopping-bag': ShoppingBagIcon,
  plane: PlaneIcon,
  users: UsersIcon,
  sparkles: SparklesIcon,
  banknote: BanknoteIcon,
  shield: ShieldIcon,
  laptop: LaptopIcon,
  gift: GiftIcon,
  dumbbell: DumbbellIcon,
  'paw-print': PawPrintIcon,
}
