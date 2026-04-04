import { screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { render } from '../../../tests/test-utils'
import { TransactionActionGroup } from './TransactionActionGroup'

describe('TransactionActionGroup', () => {
  const mockHandlers = {
    onDelete: vi.fn(),
  }

  it('renders management actions', () => {
    render(<TransactionActionGroup {...mockHandlers} />)

    expect(screen.getByText(/Delete/i)).toBeInTheDocument()
    expect(screen.queryByText(/Duplicate/i)).not.toBeInTheDocument()
  })

  it('calls onDelete when Delete button is clicked', () => {
    render(<TransactionActionGroup {...mockHandlers} />)

    fireEvent.click(screen.getByText(/Delete/i))
    expect(mockHandlers.onDelete).toHaveBeenCalled()
  })

  it('is disabled when isProcessing is true', () => {
    render(<TransactionActionGroup {...mockHandlers} isProcessing={true} />)

    expect(screen.getByRole('button', { name: /Delete/i })).toBeDisabled()
  })
})
