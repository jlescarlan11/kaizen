import type { Category } from './types'

export const CATEGORY_ICON_SEQUENCE = [
  'home',
  'utensils',
  'car',
  'bolt',
  'heartbeat',
  'film',
  'book',
  'wallet',
  'receipt',
  'credit-card',
  'shopping-bag',
  'plane',
  'users',
  'sparkles',
  'banknote',
  'shield',
  'laptop',
  'gift',
  'dumbbell',
  'paw-print',
] as const
export type CategoryIconName = (typeof CATEGORY_ICON_SEQUENCE)[number]

export const CATEGORY_ICON_LABELS: Record<CategoryIconName, string> = {
  home: 'Home',
  utensils: 'Food',
  car: 'Transport',
  bolt: 'Utilities',
  heartbeat: 'Health',
  film: 'Entertainment',
  book: 'Education',
  wallet: 'Savings',
  receipt: 'Bills',
  'credit-card': 'Subscriptions',
  'shopping-bag': 'Shopping',
  plane: 'Travel',
  users: 'Family',
  sparkles: 'Personal care',
  banknote: 'Debt',
  shield: 'Emergency fund',
  laptop: 'Work',
  gift: 'Gifts',
  dumbbell: 'Fitness',
  'paw-print': 'Pets',
}

export const CATEGORY_COLOR_PALETTE = [
  '#1d4ed8',
  '#ea580c',
  '#059669',
  '#b91c1c',
  '#7c3aed',
  '#0f766e',
  '#d97706',
  '#0f172a',
  '#2563eb',
  '#db2777',
  '#0891b2',
  '#4f46e5',
  '#65a30d',
  '#c2410c',
  '#475569',
  '#be123c',
]

// Dark mode palette variants must be defined here once PRD Open Question 8 confirms the theme scope.

export interface CategoryDesign {
  icon: CategoryIconName
  color: string
}

export interface DefaultCategoryDesign extends CategoryDesign {
  name: string
}

export const DEFAULT_CATEGORY_DESIGNS: DefaultCategoryDesign[] = [
  { name: 'Housing', icon: 'home', color: '#1d4ed8' },
  { name: 'Food', icon: 'utensils', color: '#ea580c' },
  { name: 'Transport', icon: 'car', color: '#059669' },
  { name: 'Utilities', icon: 'bolt', color: '#d97706' },
  { name: 'Health', icon: 'heartbeat', color: '#b91c1c' },
  { name: 'Entertainment', icon: 'film', color: '#7c3aed' },
  { name: 'Education', icon: 'book', color: '#2563eb' },
  { name: 'Savings', icon: 'wallet', color: '#0f766e' },
  { name: 'Bills', icon: 'receipt', color: '#475569' },
  { name: 'Subscriptions', icon: 'credit-card', color: '#4f46e5' },
  { name: 'Shopping', icon: 'shopping-bag', color: '#db2777' },
  { name: 'Travel', icon: 'plane', color: '#0891b2' },
  { name: 'Family', icon: 'users', color: '#65a30d' },
  { name: 'Personal Care', icon: 'sparkles', color: '#c2410c' },
  { name: 'Debt', icon: 'banknote', color: '#0f172a' },
  { name: 'Emergency Fund', icon: 'shield', color: '#be123c' },
]

export function getAutoAssignedCategoryDesign(
  existingCustomCategories: Category[],
): CategoryDesign {
  const customCount = existingCustomCategories.filter((category) => !category.isGlobal).length
  const iconIndex = customCount % CATEGORY_ICON_SEQUENCE.length
  const colorIndex = customCount % CATEGORY_COLOR_PALETTE.length

  // PRD Open Question 6: Default to cyclic assignment until explicit selection is confirmed.
  return {
    icon: CATEGORY_ICON_SEQUENCE[iconIndex],
    color: CATEGORY_COLOR_PALETTE[colorIndex],
  }
}

export function isCategoryIconName(value: string): value is CategoryIconName {
  return (CATEGORY_ICON_SEQUENCE as readonly string[]).includes(value)
}

export function resolveCategoryDesign(
  categoryName: string,
  icon?: string | null,
  color?: string | null,
): CategoryDesign {
  const matchedDefault = DEFAULT_CATEGORY_DESIGNS.find(
    (design) => design.name.toLowerCase() === categoryName.toLowerCase(),
  )

  return {
    icon: icon && isCategoryIconName(icon) ? icon : (matchedDefault?.icon ?? 'home'),
    color: color && color.trim() ? color : (matchedDefault?.color ?? CATEGORY_COLOR_PALETTE[0]),
  }
}
