import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../shared/components/Button'
import { Input } from '../shared/components/Input'

describe('Input and Button interactions', () => {
  it('updates input value when typing', () => {
    render(<Input id="email" label="Email" />)

    const input = screen.getByLabelText(/email/i)
    fireEvent.change(input, { target: { value: 'dev@kaizen.test' } })

    expect(input).toHaveValue('dev@kaizen.test')
  })

  it('exposes the error state semantically and visually', () => {
    render(<Input id="password" label="Password" error="Password is required" />)

    const input = screen.getByLabelText(/password/i)
    const message = screen.getByText(/password is required/i)

    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'password-error')
    expect(input).toHaveClass('placeholder:text-ui-subtle', 'border-ui-danger')
    expect(message).toHaveAttribute('id', 'password-error')
    expect(message).toHaveClass('text-ui-danger-text-soft')
  })

  it('invokes click handler when button is pressed', () => {
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Submit</Button>)
    const button = screen.getByRole('button', { name: /submit/i })

    expect(button).toHaveClass('bg-ui-action', 'text-ui-action-text')
    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
