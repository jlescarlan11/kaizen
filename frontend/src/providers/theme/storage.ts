'use client'

import type { Theme } from './context'

export const THEME_STORAGE_KEY = 'kaizen-theme'
const VALID_THEMES: readonly Theme[] = ['light', 'dark', 'system']

export function isTheme(value: string): value is Theme {
  return VALID_THEMES.includes(value as Theme)
}

export function getStoredTheme(): Theme {
  try {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)

    if (storedTheme && isTheme(storedTheme)) {
      return storedTheme
    }

    if (storedTheme) {
      try {
        localStorage.setItem(THEME_STORAGE_KEY, 'system')
      } catch {
        // Fall back to in-memory state when storage writes are unavailable.
      }
    }
  } catch {
    // Fall back to in-memory state when storage reads are unavailable.
  }

  return 'system'
}

export function persistTheme(theme: Theme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Fall back to in-memory state when storage writes are unavailable.
  }
}
