import type { Category } from './types'

export async function getCategories(): Promise<Category[]> {
  const response = await fetch('/api/categories')
  if (!response.ok) {
    throw new Error('Failed to fetch categories')
  }
  return response.json()
}
