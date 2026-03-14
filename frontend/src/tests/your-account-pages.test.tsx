import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from '../providers/theme'
import { AppearancePage } from '../features/your-account/AppearancePage'
import { YourAccountPage } from '../features/your-account/YourAccountPage'

function installMatchMedia(matches: boolean): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

function renderWithThemeProvider(element: ReactElement): void {
  render(
    <MemoryRouter>
      <ThemeProvider>{element}</ThemeProvider>
    </MemoryRouter>,
  )
}

describe('Your account pages', () => {
  beforeEach(() => {
    cleanup()
    localStorage.clear()
    installMatchMedia(false)
  })

  it('navigates from the account page to appearance', () => {
    render(
      <MemoryRouter initialEntries={['/your-account']}>
        <Routes>
          <Route path="/your-account" element={<YourAccountPage />} />
          <Route
            path="/your-account/appearance"
            element={
              <ThemeProvider>
                <AppearancePage />
              </ThemeProvider>
            }
          />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('link', { name: /appearance/i }))

    expect(screen.getByRole('heading', { name: /appearance/i })).toBeInTheDocument()
    expect(screen.getByText(/following system preference \(light\)/i)).toBeInTheDocument()
  })

  it('renders non-functional rows without links', () => {
    render(
      <MemoryRouter>
        <YourAccountPage />
      </MemoryRouter>,
    )

    expect(screen.getByText(/notification/i).closest('a')).toBeNull()
    expect(screen.getByText(/log out/i).closest('a')).toBeNull()
  })

  it('updates theme selection on the appearance page', () => {
    renderWithThemeProvider(<AppearancePage />)

    const systemButton = screen.getByRole('button', { name: /system/i })
    const darkButton = screen.getByRole('button', { name: /dark/i })

    expect(systemButton).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByText(/following system preference \(light\)/i)).toBeInTheDocument()

    fireEvent.click(darkButton)

    expect(darkButton).toHaveAttribute('aria-pressed', 'true')
    expect(systemButton).toHaveAttribute('aria-pressed', 'false')
    expect(screen.getByText(/theme set to dark mode/i)).toBeInTheDocument()
    expect(localStorage.getItem('kaizen-theme')).toBe('dark')
  })
})
