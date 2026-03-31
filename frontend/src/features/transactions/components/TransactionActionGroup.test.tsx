import { screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { render } from '../../../tests/test-utils'
import { TransactionActionGroup } from './TransactionActionGroup'

describe('TransactionActionGroup', () => {
  const mockHandlers = {
    onDelete: vi.fn(),
    onDuplicate: vi.fn(),
  }

  it('renders all management actions', () => {
    render(<TransactionActionGroup {...mockHandlers} />)

    expect(screen.getByText(/Delete/i)).toBeInTheDocument()
    expect(screen.getByText(/Duplicate/i)).toBeInTheDocument()
  })

  it('calls onDelete when Delete button is clicked', () => {
    render(<TransactionActionGroup {...mockHandlers} />)

    fireEvent.click(screen.getByText(/Delete/i))
    expect(mockHandlers.onDelete).toHaveBeenCalled()
  })

  it('calls onDuplicate when Duplicate button is clicked', () => {
    render(<TransactionActionGroup {...mockHandlers} />)

    fireEvent.click(screen.getByText(/Duplicate/i))
    expect(mockHandlers.onDuplicate).toHaveBeenCalled()
  })

  it('is disabled when isProcessing is true', () => {
    render(<TransactionActionGroup {...mockHandlers} isProcessing={true} />)

    expect(screen.getByRole('button', { name: /Delete/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Duplicate/i })).toBeDisabled()
  })
})
