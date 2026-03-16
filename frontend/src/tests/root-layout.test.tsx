import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { RootLayout } from '../app/router/RootLayout'
import { ThemeProvider } from '../providers/theme'

afterEach(() => {
  cleanup()
  localStorage.clear()
})

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' ? false : false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

describe('RootLayout', () => {
  it('uses theme token classes for the shell and active navigation', () => {
    const { container } = render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/']}>
          <RootLayout />
        </MemoryRouter>
      </ThemeProvider>,
    )

    const shell = container.firstElementChild
    const header = container.querySelector('header')
    const brandLink = screen.getByRole('link', { name: /kaizen home/i })
    const homeLink = screen.getByRole('link', { name: /^home$/i })
    const playgroundLink = screen.getByRole('link', { name: /^playground$/i })
    const brandLogo = screen.getByRole('img', { name: /kaizen/i })
    const brandLogos = screen.getAllByRole('img', { name: /kaizen/i })

    expect(shell).toHaveClass('bg-ui-bg', 'text-foreground')
    expect(header).toHaveClass('border-ui-border', 'bg-ui-surface')
    expect(brandLink).toHaveAttribute('href', '/')
    expect(brandLink).toHaveClass('text-foreground')
    expect(brandLogo.tagName.toLowerCase()).toBe('span')
    expect(brandLogo).toHaveClass('h-10', 'w-10', 'shrink-0')
    expect(brandLogos).toHaveLength(1)
    expect(homeLink).toHaveClass('bg-ui-accent-subtle', 'text-foreground')
    expect(playgroundLink).toHaveClass(
      'text-foreground',
      'hover:bg-ui-accent-subtle',
      'hover:text-foreground',
    )
  })

  it('keeps the same inline logo in dark mode', () => {
    localStorage.setItem('kaizen-theme', 'dark')

    render(
      <ThemeProvider>
        <MemoryRouter initialEntries={['/']}>
          <RootLayout />
        </MemoryRouter>
      </ThemeProvider>,
    )

    const brandLogo = screen.getByRole('img', { name: /kaizen/i })

    expect(brandLogo.tagName.toLowerCase()).toBe('span')
    expect(brandLogo).toHaveClass('h-10', 'w-10', 'shrink-0')
  })
})
