import { type ReactElement, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../app/store/hooks'
import { useUpdateOnboardingProgressMutation } from '../../app/store/api/authApi'
import { ONBOARDING_STEP_ROUTE_MAP, type OnboardingStep } from './onboardingStep'
import {
  setCurrentStep,
  setStartingFunds,
  setFundingSourceType,
  updateInitialBalance,
  selectInitialBalances,
} from './onboardingSlice'
import { OnboardingErrorBlock } from './OnboardingErrorBlock'
import { useOnboardingErrorHandler } from './useOnboardingErrorHandler'
import { useGetPaymentMethodsQuery } from '../../app/store/api/paymentMethodApi'
import { Input, Button } from '../../shared/components'
import { formatCurrency } from '../../shared/lib/formatCurrency'
import { fluidLayout } from '../../shared/styles/layout'
import { typography } from '../../shared/styles/typography'
import { cn } from '../../shared/lib/cn'

export function BalanceSetupStep(): ReactElement {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [updateProgress] = useUpdateOnboardingProgressMutation()
  const { data: rawPaymentMethods = [], isLoading: isLoadingMethods } = useGetPaymentMethodsQuery()

  const paymentMethods = useMemo(() => {
    return [...rawPaymentMethods].sort((a, b) => {
      if (a.name.toLowerCase() === 'cash') return -1
      if (b.name.toLowerCase() === 'cash') return 1
      return a.name.localeCompare(b.name)
    })
  }, [rawPaymentMethods])

  const initialBalances = useAppSelector(selectInitialBalances)

  const {
    handleRequest,
    retry,
    error: onboardingError,
    isRetryDisabled,
  } = useOnboardingErrorHandler('BALANCE' as OnboardingStep)

  const totalBalance = useMemo(() => {
    return initialBalances.reduce((sum, b) => sum + b.amount, 0)
  }, [initialBalances])

  const hasAnyBalance = useMemo(() => {
    return initialBalances.some((b) => b.amount > 0)
  }, [initialBalances])

  const handleBalanceChange = (paymentMethodId: number, value: string) => {
    const amount = parseFloat(value) || 0
    dispatch(updateInitialBalance({ paymentMethodId, amount }))
  }

  const handleContinue = async (): Promise<void> => {
    dispatch(setStartingFunds(totalBalance))
    dispatch(setFundingSourceType('CASH_ON_HAND'))

    const activeBalances = initialBalances.filter((b) => b.amount > 0)

    const mappedBalances = activeBalances.map((b) => ({
      paymentMethodId: b.paymentMethodId,
      amount: b.amount,
      description: 'Opening Balance',
      notes: 'Initial setup',
      transactionDate: new Date().toISOString(),
    }))

    try {
      dispatch(setCurrentStep('BUDGET'))

      await handleRequest(() =>
        updateProgress({
          currentStep: 'BUDGET' as OnboardingStep, // Mark as BUDGET complete
          startingFunds: totalBalance,
          fundingSourceType: 'CASH_ON_HAND',
          initialBalances: mappedBalances,
        }).unwrap(),
      )

      const nextRoute = ONBOARDING_STEP_ROUTE_MAP['BUDGET']
      navigate(nextRoute)
    } catch (err) {
      console.error('Balance setup progress update failed:', err)
      // Revert on failure
      dispatch(setCurrentStep('BALANCE'))
    }
  }

  if (isLoadingMethods) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className={cn('flex w-full flex-col', fluidLayout.sectionGap)}>
      <div className="">
        {paymentMethods.map((pm, index) => {
          const balance = initialBalances.find((b) => b.paymentMethodId === pm.id)
          const amountValue = balance ? balance.amount.toString() : ''

          return (
            <div key={pm.id} className="">
              {index > 0 && <hr className="border-ui-border-subtle" />}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6 px-4 py-3.5">
                <label
                  htmlFor={`balance-${pm.id}`}
                  className={cn(typography.label, 'text-foreground')}
                >
                  {pm.name}
                </label>

                <div className="w-full sm:w-48 lg:w-64">
                  <Input
                    id={`balance-${pm.id}`}
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    placeholder="0.00"
                    value={amountValue}
                    onChange={(e) => handleBalanceChange(pm.id, e.target.value)}
                    startAdornment={
                      <span className="text-sm font-semibold text-muted-foreground">PHP</span>
                    }
                    className={cn(fluidLayout.touchTarget, 'text-lg font-semibold text-right')}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <hr className="my-10 border-ui-border" />

      {/* Summary and Navigation */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ui-border-subtle bg-background/95 px-5 py-4 backdrop-blur-sm sm:relative sm:inset-auto sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between sm:rounded-2xl sm:bg-ui-card sm:p-0">
          <div className="flex flex-col gap-0.5 sm:gap-1 sm:p-0">
            <p className="text-xs font-medium text-muted-foreground sm:text-sm sm:text-foreground">
              Total Starting Funds
            </p>
            <p className="text-lg font-semibold text-foreground">{formatCurrency(totalBalance)}</p>
          </div>

          <Button
            onClick={handleContinue}
            variant="primary"
            className={cn(
              fluidLayout.touchTarget,
              'rounded-full p-0 sm:rounded-xl sm:px-8',
              'h-12 w-12 sm:h-auto sm:w-auto',
            )}
            disabled={!hasAnyBalance}
            aria-label="Continue to budgets"
          >
            <span className="hidden sm:inline">Continue to budgets</span>
            <ArrowRight className="h-6 w-6 sm:hidden" />
          </Button>
        </div>

        {onboardingError ? (
          <div className="mt-4">
            <OnboardingErrorBlock
              error={onboardingError}
              onRetry={retry}
              isRetryDisabled={isRetryDisabled}
            />
          </div>
        ) : null}
      </div>
    </div>
  )
}
