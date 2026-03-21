import { type ChangeEvent, type ReactElement, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../shared/components/Button'
import { Input } from '../../shared/components/Input'
import { validateBalance } from '../../shared/lib/validation'
import { useAppDispatch, useAppSelector } from '../../app/store/hooks'
import { useUpdateOnboardingProgressMutation } from '../../app/store/api/authApi'
import { ONBOARDING_STEP_ROUTE_MAP, type OnboardingStep } from './onboardingStep'
import { selectBalanceValue, setBalanceValue, setCurrentStep } from './onboardingSlice'

export function BalanceSetupStep(): ReactElement {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const currentBalance = useAppSelector(selectBalanceValue)
  const [updateProgress, { isLoading }] = useUpdateOnboardingProgressMutation()
  const [error, setError] = useState<string | null>(null)

  const displayValue = currentBalance != null ? currentBalance.toFixed(2) : ''
  const balanceError = useMemo(() => validateBalance(displayValue), [displayValue])

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const parsed = parseFloat(event.target.value)
    if (Number.isNaN(parsed)) {
      dispatch(setBalanceValue(null))
      return
    }
    dispatch(setBalanceValue(parsed))
  }

  const handleContinue = async (): Promise<void> => {
    if (balanceError) {
      return
    }

    if (currentBalance == null) {
      setError('Please enter your opening balance before continuing.')
      return
    }

    setError(null)
    try {
      await updateProgress({
        currentStep: 'BALANCE' as OnboardingStep,
        balanceValue: currentBalance,
      }).unwrap()
      dispatch(setCurrentStep('BUDGET'))
      navigate(ONBOARDING_STEP_ROUTE_MAP['BUDGET'])
    } catch {
      setError('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="space-y-6 rounded-2xl bg-ui-surface p-6 md:p-10">
      <div>
        <p className="text-sm font-semibold text-foreground">Step 1: Set your opening balance</p>
        <p className="text-sm text-muted-foreground">
          Enter the amount you currently hold in your main account.
        </p>
      </div>

      <Input
        label="Opening Balance"
        type="number"
        value={displayValue}
        onChange={handleChange}
        placeholder="0.00"
        startAdornment="₱"
        endAdornment="PHP"
        min="0"
        step="0.01"
        error={balanceError ?? undefined}
      />

      {error && <p className="text-sm text-destructive text-center">{error}</p>}

      <Button
        className="w-full"
        onClick={handleContinue}
        isLoading={isLoading || Boolean(balanceError)}
      >
        Continue
      </Button>
    </div>
  )
}
