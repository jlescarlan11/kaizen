import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { AuthenticatedLayout } from '../app/router/AuthenticatedLayout'
import { render } from './test-utils'

afterEach(() => {
  localStorage.clear()
})

function mockMediaQuery(maxWidth: number) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: query === `(max-width: ${maxWidth}px)`,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

describe('Navigation Cleanup', () => {
  it('should NOT contain "Add Entry" in desktop sidebar', () => {
    mockMediaQuery(1200) // Desktop
    render(<AuthenticatedLayout />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { id: '1', name: 'Test User', email: 'test@example.com' },
          loading: false,
          error: null,
        },
      },
    })

    const sidebar = screen.getByRole('complementary')
    expect(sidebar).toBeInTheDocument()

    // "Add Entry" should NOT be in the sidebar anymore
    const addEntryLink = screen.queryByRole('link', { name: /add entry/i })
    expect(addEntryLink).not.toBeInTheDocument()
  })

  it('should NOT contain "Add Entry" in mobile bottom navigation', () => {
    mockMediaQuery(768) // Mobile
    render(<AuthenticatedLayout />, {
      preloadedState: {
        auth: {
          isAuthenticated: true,
          user: { id: '1', name: 'Test User', email: 'test@example.com' },
          loading: false,
          error: null,
        },
      },
    })

    const bottomNav = screen.getByRole('navigation')
    expect(bottomNav).toBeInTheDocument()

    // "Add Entry" should NOT be in the bottom nav anymore
    const addEntryLink = screen.queryByRole('link', { name: /add entry/i })
    expect(addEntryLink).not.toBeInTheDocument()
  })
})
