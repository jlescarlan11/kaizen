'use client'

import { useEffect, useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import { ThemeContext, type Theme } from './context'
import { getStoredTheme, persistTheme } from './storage'

const DARK_MODE_MEDIA_QUERY = '(prefers-color-scheme: dark)'

type ThemeProviderProps = {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps): ReactElement {
  const [theme, setThemeState] = useState<Theme>(getStoredTheme)
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const mediaQuery = window.matchMedia(DARK_MODE_MEDIA_QUERY)

    const updateResolvedTheme = (): void => {
      if (theme === 'system') {
        setResolvedTheme(mediaQuery.matches ? 'dark' : 'light')
        return
      }

      setResolvedTheme(theme)
    }

    updateResolvedTheme()

    if (theme !== 'system') {
      return
    }

    const handleChange = (): void => {
      updateResolvedTheme()
    }

    mediaQuery.addEventListener('change', handleChange)

    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  useEffect(() => {
    const rootElement = document.documentElement

    rootElement.classList.remove('light', 'dark')
    rootElement.classList.add(resolvedTheme)
    rootElement.setAttribute('data-theme', resolvedTheme)
  }, [resolvedTheme])

  const setTheme = (nextTheme: Theme): void => {
    setThemeState(nextTheme)
    persistTheme(nextTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
