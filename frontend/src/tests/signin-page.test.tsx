import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { AppProviders } from '../app/providers/AppProviders'
import { RootLayout } from '../app/router/RootLayout'
import { SigninPage } from '../features/signin/SigninPage'

const renderSigninPage = (initialEntry = '/signin') => {
  const router = createMemoryRouter(
    [
      {
        element: <RootLayout />,
        children: [
          {
            path: '/signin',
            element: <SigninPage />,
          },
        ],
      },
    ],
    { initialEntries: [initialEntry] },
  )

  return render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  )
}

describe('SigninPage', () => {
  it('renders Google social auth button', () => {
    renderSigninPage()

    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Continue with Facebook' })).not.toBeInTheDocument()
  })

  it('renders error message from URL query parameter', () => {
    renderSigninPage('/signin?error=ACCOUNT_EXISTS')

    expect(
      screen.getByText('An account with this email already exists. Please log in instead.'),
    ).toBeInTheDocument()
  })

  it('renders generic error message for unknown error code', () => {
    renderSigninPage('/signin?error=SOME_UNKNOWN_ERROR')

    expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument()
  })

  it('redirects to the Google backend OAuth entry point on click', () => {
    const originalLocation = window.location

    // Simple way for JSDOM in Vitest to mock location.href
    // @ts-expect-error - mock window.location
    delete window.location
    // @ts-expect-error - mock window.location
    window.location = { replace: vi.fn(), origin: 'http://localhost' } as unknown as Location

    renderSigninPage()

    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }))
    expect(window.location.replace).toHaveBeenCalledWith(
      expect.stringContaining('/auth/google/authorize'),
    )

    // @ts-expect-error - restore original
    window.location = originalLocation
  })
})
