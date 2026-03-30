import { type ReactElement, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
    <div className={cn('flex w-full flex-col pb-28 sm:pb-10', fluidLayout.sectionGap)}>
      <div className="space-y-4 md:space-y-6">
        {paymentMethods.map((pm, index) => {
          const balance = initialBalances.find((b) => b.paymentMethodId === pm.id)
          const amountValue = balance ? balance.amount.toString() : ''

          return (
            <div key={pm.id} className="space-y-4 md:space-y-6">
              {index > 0 && <hr className="border-ui-border-subtle" />}
              <div className="flex items-center justify-between gap-4 md:gap-6 px-1">
                <div className="flex-1">
                  <h3 className={cn(typography.h4, 'font-bold')}>{pm.name}</h3>
                </div>

                <div className="w-40 sm:w-48 lg:w-56">
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    placeholder="0.00"
                    value={amountValue}
                    onChange={(e) => handleBalanceChange(pm.id, e.target.value)}
                    startAdornment={
                      <span className="text-sm font-semibold text-muted-foreground">PHP</span>
                    }
                    className={cn(fluidLayout.touchTarget, 'text-lg font-bold text-right')}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary and Navigation */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-ui-border-subtle bg-background/95 px-5 py-6 backdrop-blur-sm sm:relative sm:inset-auto sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 rounded-2xl border border-ui-border bg-ui-card p-6 md:p-8 sm:border-0 sm:bg-transparent sm:p-0">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground md:text-sm">
              Total Starting Funds
            </p>
            <p className="text-3xl font-display font-bold text-foreground md:text-4xl tracking-tight">
              {formatCurrency(totalBalance)}
            </p>
          </div>
          <Button
            onClick={handleContinue}
            variant="primary"
            className={cn(
              fluidLayout.touchTarget,
              'w-full rounded-xl font-bold text-lg sm:w-auto sm:px-8',
            )}
            disabled={!hasAnyBalance}
          >
            Continue to budgets
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
