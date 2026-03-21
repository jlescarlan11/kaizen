import type { Category } from './types'

export const CATEGORY_ICON_SEQUENCE = [
  'home',
  'utensils',
  'car',
  'bolt',
  'heartbeat',
  'film',
] as const
export type CategoryIconName = (typeof CATEGORY_ICON_SEQUENCE)[number]

export const CATEGORY_COLOR_PALETTE = [
  '#1d4ed8',
  '#ea580c',
  '#059669',
  '#b91c1c',
  '#7c3aed',
  '#0f766e',
  '#d97706',
  '#0f172a',
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
