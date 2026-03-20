import { cleanup, fireEvent, screen } from '@testing-library/react'
import type { ReactElement } from 'react'
import { describe, expect, it, beforeEach, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { AppearancePage } from '../features/your-account/AppearancePage'
import { YourAccountPage } from '../features/your-account/YourAccountPage'
import { render } from './test-utils'

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
  render(element)
}

describe('Your account pages', () => {
  beforeEach(() => {
    cleanup()
    localStorage.clear()
    installMatchMedia(false)
  })

  it('navigates from the account page to appearance', () => {
    render(
      <Routes>
        <Route path="/your-account" element={<YourAccountPage />} />
        <Route path="/your-account/appearance" element={<AppearancePage />} />
      </Routes>,
      { initialEntries: ['/your-account'] },
    )

    fireEvent.click(screen.getByRole('link', { name: /appearance/i }))

    expect(screen.getByRole('heading', { name: /appearance/i })).toBeInTheDocument()
    expect(screen.getByText(/following system preference \(light\)/i)).toBeInTheDocument()
  })

  it('renders non-functional rows without links', () => {
    render(<YourAccountPage />)

    expect(screen.getByText(/notification/i).closest('a')).toBeNull()
    expect(screen.getByText(/close account/i).closest('a')).toBeNull()
    expect(screen.getByText(/close account/i).closest('button')).toBeNull()
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
