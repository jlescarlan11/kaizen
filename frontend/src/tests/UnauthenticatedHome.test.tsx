import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { UnauthenticatedHome } from '../features/home/UnauthenticatedHome'
import { RootLayout } from '../app/router/RootLayout'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AppProviders } from '../app/providers/AppProviders'

const renderFullExperience = () => {
  return render(
    <AppProviders>
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<RootLayout />}>
            <Route index element={<UnauthenticatedHome />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AppProviders>,
  )
}

describe('UnauthenticatedHome Experience', () => {
  it('renders the header with unauthenticated links', () => {
    renderFullExperience()
    expect(screen.getByRole('link', { name: /platform/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /help/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument()
  })

  it('renders the main headline', () => {
    renderFullExperience()
    expect(screen.getByText(/STOP/i)).toBeInTheDocument()
    expect(screen.getByText(/SAYING/i)).toBeInTheDocument()
  })

  it('renders dual CTAs', () => {
    renderFullExperience()
    expect(screen.getByRole('button', { name: /start your tracking/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /see how it works/i })).toBeInTheDocument()
  })

  it('renders social proof strip', () => {
    renderFullExperience()
    expect(screen.getByText(/Joined by/i)).toBeInTheDocument()
    expect(screen.getByText(/2,400\+ students/i)).toBeInTheDocument()
  })

  it('toggles mobile drawer on hamburger click', () => {
    renderFullExperience()
    const hamburger = screen.getByRole('button', { name: /open menu/i })
    fireEvent.click(hamburger)
    const drawerLinks = screen.getAllByRole('link', { name: /platform/i })
    expect(drawerLinks.length).toBeGreaterThan(1)
  })

  it('renders footer links', () => {
    renderFullExperience()
    expect(screen.getByRole('link', { name: /privacy/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /terms/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /contact/i })).toBeInTheDocument()
  })
})
