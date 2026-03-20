import type { Category } from './types'

export async function getCategories(): Promise<Category[]> {
  const response = await fetch('/api/categories')
  if (!response.ok) {
    throw new Error('Failed to fetch categories')
  }
  return response.json()
}

export interface CategoryCreatePayload {
  name: string
  icon: string
  color: string
}

export async function createCategory(payload: CategoryCreatePayload): Promise<Category> {
  const response = await fetch('/api/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error('Failed to create category')
  }

  return response.json()
}
