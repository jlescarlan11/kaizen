import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { RootLayout } from '../app/router/RootLayout'

describe('RootLayout', () => {
  it('uses theme token classes for the shell and active navigation', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <RootLayout />
      </MemoryRouter>,
    )

    const shell = container.firstElementChild
    const header = container.querySelector('header')
    const homeLink = screen.getByRole('link', { name: /home/i })
    const playgroundLink = screen.getByRole('link', { name: /playground/i })

    expect(shell).toHaveClass('bg-background', 'text-text-primary')
    expect(header).toHaveClass('border-border', 'bg-surface')
    expect(homeLink).toHaveClass('bg-primary', 'text-text-primary')
    expect(playgroundLink).toHaveClass(
      'text-text-secondary',
      'hover:bg-surface-secondary',
      'hover:text-text-primary',
    )
  })
})
