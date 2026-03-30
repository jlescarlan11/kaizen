import { type ReactElement, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../app/store/hooks'
import { useUpdateOnboardingProgressMutation } from '../../app/store/api/authApi'
import { ONBOARDING_STEP_ROUTE_MAP, type OnboardingStep } from './onboardingStep'
import {
  setCurrentStep,
  setStartingFunds,
  updateInitialBalance,
  selectInitialBalances,
} from './onboardingSlice'
import { OnboardingErrorBlock } from './OnboardingErrorBlock'
import { useOnboardingErrorHandler } from './useOnboardingErrorHandler'
import { useGetPaymentMethodsQuery } from '../../app/store/api/paymentMethodApi'
import { Input, Button } from '../../shared/components'
import { formatCurrency } from '../../shared/lib/formatCurrency'

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
    <div className="mx-auto flex w-full max-w-lg flex-col gap-8 pb-28 sm:pb-10">
      <div className="space-y-6">
        {paymentMethods.map((pm, index) => {
          const balance = initialBalances.find((b) => b.paymentMethodId === pm.id)
          const amountValue = balance ? balance.amount.toString() : ''

          return (
            <div key={pm.id} className="space-y-6">
              {index > 0 && <hr className="border-ui-border-subtle" />}
              <div className="flex items-center justify-between gap-6 px-1">
                <div className="flex-1">
                  <h3 className="text-base font-bold text-foreground">{pm.name}</h3>
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
                    className="h-11 text-lg font-bold text-right"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary and Navigation */}
      <div className="mt-6 flex flex-col gap-6">
        <div className="flex flex-col gap-6 border-t border-ui-border pt-8 px-1">
          <div className="flex items-center justify-between">
            <p className="text-sm text-subtle-foreground uppercase tracking-wider font-semibold">
              Total Starting Funds
            </p>
            <p className="text-2xl font-bold text-foreground tracking-tight">
              {formatCurrency(totalBalance)}
            </p>
          </div>
          <Button
            onClick={handleContinue}
            className="h-12 w-full rounded-xl font-bold text-base"
            disabled={!hasAnyBalance}
          >
            Continue to budgets
          </Button>
        </div>

        {onboardingError ? (
          <OnboardingErrorBlock
            error={onboardingError}
            onRetry={retry}
            isRetryDisabled={isRetryDisabled}
          />
        ) : null}
      </div>
    </div>
  )
}
