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

  it('invokes click handler when button is pressed', () => {
    const handleClick = vi.fn()

    render(<Button onClick={handleClick}>Submit</Button>)
    fireEvent.click(screen.getByRole('button', { name: /submit/i }))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
