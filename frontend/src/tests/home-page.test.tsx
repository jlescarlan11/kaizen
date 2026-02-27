import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { HomePage } from '../features/home/HomePage'

describe('HomePage', () => {
  it('renders starter headline', () => {
    render(<HomePage />)
    expect(screen.getByRole('heading', { name: /kaizen ui starter/i })).toBeInTheDocument()
  })
})
