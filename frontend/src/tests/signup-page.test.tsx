import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AppProviders } from '../app/providers/AppProviders'
import { RootLayout } from '../app/router/RootLayout'
import { SignupPage } from '../features/signup/SignupPage'

const renderSignupPage = (initialEntry = '/signup') => {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/signup" element={<SignupPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AppProviders>,
  )
}

describe('SignupPage', () => {
  it('renders Google social sign-up button', () => {
    renderSignupPage()

    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Continue with Facebook' })).not.toBeInTheDocument()
  })

  it('renders error message from URL query parameter', () => {
    renderSignupPage('/signup?error=ACCOUNT_EXISTS')

    expect(
      screen.getByText('An account with this email already exists. Please log in instead.'),
    ).toBeInTheDocument()
  })

  it('renders generic error message for unknown error code', () => {
    renderSignupPage('/signup?error=SOME_UNKNOWN_ERROR')

    expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument()
  })

  it('redirects to the Google backend OAuth entry point on click', () => {
    const originalLocation = window.location

    // Simple way for JSDOM in Vitest to mock location.href
    // @ts-expect-error - mock window.location
    delete window.location
    // @ts-expect-error - mock window.location
    window.location = { href: '' } as unknown as Location

    renderSignupPage()

    fireEvent.click(screen.getByRole('button', { name: 'Continue with Google' }))
    expect(window.location.href).toContain('/auth/google/authorize')

    // @ts-expect-error - restore original
    window.location = originalLocation
  })
})
