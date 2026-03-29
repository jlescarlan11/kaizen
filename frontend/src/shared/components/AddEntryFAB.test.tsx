import { screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AddEntryFAB } from './AddEntryFAB'
import { render } from '../../tests/test-utils'

describe('AddEntryFAB', () => {
  it('should render the FAB with an Add icon', () => {
    render(<AddEntryFAB onClick={() => {}} />)

    const fab = screen.getByRole('button', { name: /add entry/i })
    expect(fab).toBeInTheDocument()
    expect(fab).toHaveClass('rounded-full', 'bg-ui-action-bg')
  })

  it('should trigger onClick when clicked', () => {
    const handleClick = vi.fn()
    render(<AddEntryFAB onClick={handleClick} />)

    const fab = screen.getByRole('button', { name: /add entry/i })
    fireEvent.click(fab)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should have a shadow and be circular', () => {
    render(<AddEntryFAB onClick={() => {}} />)

    const fab = screen.getByRole('button', { name: /add entry/i })
    expect(fab).toHaveClass('shadow-lg', 'rounded-full')
  })
})
