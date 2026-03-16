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
    const platformLink = screen.getByRole('link', { name: /^platform$/i })
    const playgroundLink = screen.getByRole('link', { name: /^playground$/i })
    const brandLogo = screen.getByRole('img', { name: /kaizen/i })
    const brandLogos = screen.getAllByRole('img', { name: /kaizen/i })

    expect(shell).toHaveClass(
      'min-h-screen',
      'flex',
      'flex-col',
      'bg-background',
      'text-foreground',
    )
    expect(header).toHaveClass('bg-background')
    expect(brandLink).toHaveAttribute('href', '/')
    expect(brandLink).toHaveClass('text-foreground')
    expect(brandLogo.tagName.toLowerCase()).toBe('span')
    expect(brandLogo).toHaveClass('h-10', 'w-10', 'shrink-0')
    expect(brandLogos).toHaveLength(1)
    expect(platformLink).toHaveClass(
      'text-muted-foreground',
      'hover:bg-black/5',
      'hover:text-foreground',
    )
    expect(playgroundLink).toHaveClass(
      'text-muted-foreground',
      'hover:bg-black/5',
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
