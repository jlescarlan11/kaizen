import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Button } from '../shared/components/Button'
import { Input } from '../shared/components/Input'
import { Select } from '../shared/components/Select'

describe('Input and Button interactions', () => {
  it('updates input value when typing', () => {
    render(<Input id="email" label="Email" />)

    const input = screen.getByLabelText(/email/i)
    fireEvent.change(input, { target: { value: 'dev@kaizen.test' } })

    expect(input).toHaveValue('dev@kaizen.test')
  })

  it('renders the input with a separate label', () => {
    render(<Input id="amount" label="Amount" value="1200" readOnly />)

    const input = screen.getByLabelText(/amount/i)
    const label = screen.getByText('Amount')

    expect(input).toHaveValue('1200')
    // Check for core utility patterns from formFieldClasses
    expect(input).toHaveClass('bg-ui-surface', 'text-ui', 'rounded-xl')
    expect(label).toHaveClass('text-sm', 'font-medium', 'text-ui')
  })

  it('renders the select with a separate label and placeholder option', () => {
    const options = [{ value: 'income', label: 'Income' }]
    render(<Select id="category" label="Category" defaultValue="" options={options} />)

    const label = screen.getByText('Category')
    const button = screen.getByRole('button')

    expect(label).toHaveClass('text-sm', 'font-medium', 'text-ui')
    expect(button).toHaveClass('bg-ui-surface', 'rounded-xl')
    expect(screen.getByText('Select an option')).toBeInTheDocument()
  })

  it('allows selecting an option from the listbox', async () => {
    const options = [
      { value: 'income', label: 'Income' },
      { value: 'expense', label: 'Expense' },
    ]
    const handleChange = vi.fn()

    render(<Select label="Category" options={options} onChange={handleChange} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    const option = await screen.findByRole('option', { name: 'Expense' })
    fireEvent.click(option)

    expect(handleChange).toHaveBeenCalledWith('expense')
  })

  it('exposes the error state semantically and visually', () => {
    render(
      <Input
        id="password"
        label="Password"
        error="Password is required"
        helperText="Minimum 8 characters."
      />,
    )

    const input = screen.getByLabelText(/password/i)
    const label = screen.getByText('Password')
    const message = screen.getByText(/password is required/i)
    const helper = screen.queryByText(/minimum 8 characters/i)

    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'password-error')
    expect(input).not.toHaveAttribute(
      'aria-describedby',
      expect.stringContaining('password-helper'),
    )
    expect(input).toHaveClass('aria-invalid:border-ui-danger')
    expect(label).toHaveClass('text-sm', 'font-medium', 'text-ui')
    expect(message).toHaveAttribute('id', 'password-error')
    expect(message).toHaveClass('text-ui-danger-text-soft')
    expect(helper).not.toBeInTheDocument()
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
