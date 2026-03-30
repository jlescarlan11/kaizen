import { screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { render } from './test-utils'
import { BalanceSetupStep } from '../features/onboarding/BalanceSetupStep'
import { createInitialOnboardingState } from '../features/onboarding/onboardingSlice'

// Mock update onboarding mutation
const updateProgress = vi.fn().mockReturnValue({ unwrap: () => Promise.resolve() })
vi.mock('../app/store/api/authApi', () => ({
  useUpdateOnboardingProgressMutation: () => [updateProgress, { isLoading: false }],
  useCompleteOnboardingMutation: () => [vi.fn(), { isLoading: false }],
}))

// Mock payment methods query
vi.mock('../app/store/api/paymentMethodApi', () => ({
  useGetPaymentMethodsQuery: () => ({
    data: [
      { id: 1, name: 'Cash', isGlobal: true, description: 'Cash description' },
      { id: 2, name: 'Bank Account (Debit Card)', isGlobal: true, description: 'Bank description' },
    ],
    isLoading: false,
  }),
}))

describe('BalanceSetupStep', () => {
  const preloadedState = {
    onboarding: {
      ...createInitialOnboardingState(),
      initialBalances: [],
    },
  }

  it('renders minimalist UI without custom step headings', async () => {
    render(<BalanceSetupStep />, { preloadedState })

    expect(
      screen.queryByText('Start with suggested amounts, adjust what you need'),
    ).not.toBeInTheDocument()

    expect(screen.getByText('Cash')).toBeInTheDocument()
    expect(screen.getByText('Bank Account (Debit Card)')).toBeInTheDocument()
  })

  it('enables continue button only when at least one balance is positive', async () => {
    render(<BalanceSetupStep />, { preloadedState })

    const continueBtn = screen.getByRole('button', { name: /continue to budgets/i })
    expect(continueBtn).toBeDisabled()

    const inputs = screen.getAllByPlaceholderText('0.00')

    // Type 0
    fireEvent.change(inputs[0], { target: { value: '0' } })
    expect(continueBtn).toBeDisabled()

    // Type 100
    fireEvent.change(inputs[0], { target: { value: '100' } })
    expect(continueBtn).not.toBeDisabled()
  })

  it('calls updateProgress with all non-zero initialBalances on continue', async () => {
    render(<BalanceSetupStep />, { preloadedState })

    const inputs = screen.getAllByPlaceholderText('0.00')
    fireEvent.change(inputs[0], { target: { value: '1000' } })

    const continueBtn = screen.getByRole('button', { name: /continue to budgets/i })
    fireEvent.click(continueBtn)

    await waitFor(() => {
      expect(updateProgress).toHaveBeenCalledWith(
        expect.objectContaining({
          initialBalances: expect.arrayContaining([
            expect.objectContaining({
              paymentMethodId: 1,
              amount: 1000,
            }),
          ]),
        }),
      )
    })
  })

  describe('Mobile-first Responsiveness', () => {
    it('applies fluid layout classes to root container', () => {
      const { container } = render(<BalanceSetupStep />, { preloadedState })
      const root = container.firstChild as HTMLElement
      // Check for root layout classes
      expect(root).toHaveClass('flex', 'w-full', 'flex-col')
    })

    it('uses standardized touch targets (h-12) for inputs and button', () => {
      render(<BalanceSetupStep />, { preloadedState })

      const inputs = screen.getAllByPlaceholderText('0.00')
      inputs.forEach((input) => {
        expect(input).toHaveClass('h-12')
      })

      const continueBtn = screen.getByRole('button', { name: /continue to budgets/i })
      expect(continueBtn).toHaveClass('h-12')
    })

    it('renders summary with prominent typography', () => {
      render(<BalanceSetupStep />, { preloadedState })

      const totalLabel = screen.getByText('Total Starting Funds')
      expect(totalLabel).toBeInTheDocument()

      const totalAmount = screen.getByText(/PHP 0\.00/)
      expect(totalAmount).toHaveClass('text-lg', 'font-semibold')
    })

    it('verifies correct responsive spacing and layout tokens', () => {
      render(<BalanceSetupStep />, { preloadedState })

      // Check payment method labels
      const label = screen.getByText('Cash')
      expect(label).toHaveClass('text-sm', 'font-medium')
    })
  })
})
