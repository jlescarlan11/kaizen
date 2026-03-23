import type { Category } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim() || ''

export async function getCategories(): Promise<Category[]> {
  const response = await fetch(`${API_BASE_URL}/categories`, {
    credentials: 'include',
  })
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
  const response = await fetch(`${API_BASE_URL}/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to create category')
  }

  return response.json()
}

export async function updateCategory(
  categoryId: number,
  payload: CategoryCreatePayload,
): Promise<Category> {
  const response = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to update category')
  }

  return response.json()
}
