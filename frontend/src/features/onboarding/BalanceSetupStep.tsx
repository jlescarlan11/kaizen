import { type ChangeEvent, type ReactElement, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../shared/components/Button'
import { Input } from '../../shared/components/Input'
import { Select } from '../../shared/components/Select'
import { validateBalance } from '../../shared/lib/validation'
import { typography } from '../../shared/styles/typography'
import { useAppDispatch, useAppSelector } from '../../app/store/hooks'
import { useUpdateOnboardingProgressMutation } from '../../app/store/api/authApi'
import { ONBOARDING_STEP_ROUTE_MAP, type OnboardingStep } from './onboardingStep'
import {
  selectFundingSourceType,
  selectStartingFunds,
  selectStartingFundsInput,
  setCurrentStep,
  setFundingSourceType,
  setStartingFunds,
  setStartingFundsInput,
} from './onboardingSlice'
import { OnboardingErrorBlock } from './OnboardingErrorBlock'
import { useOnboardingErrorHandler } from './useOnboardingErrorHandler'
import {
  FUNDING_SOURCE_HELP_TEXT,
  FUNDING_SOURCE_OPTIONS,
  type FundingSourceType,
} from './fundingSource'

const formatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
})

export function BalanceSetupStep(): ReactElement {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const startingFunds = useAppSelector(selectStartingFunds)
  const startingFundsInput = useAppSelector(selectStartingFundsInput)
  const fundingSourceType = useAppSelector(selectFundingSourceType)
  const [updateProgress, { isLoading }] = useUpdateOnboardingProgressMutation()
  const [error, setError] = useState<string | null>(null)
  const [fundingSourceError, setFundingSourceError] = useState<string | null>(null)
  const {
    handleRequest,
    retry,
    error: onboardingError,
    isRetryDisabled,
  } = useOnboardingErrorHandler('BALANCE' as OnboardingStep)

  const balanceError = useMemo(() => validateBalance(startingFundsInput), [startingFundsInput])

  const parsedBalance = parseFloat(startingFundsInput)
  const hasValidBalance = !Number.isNaN(parsedBalance) && parsedBalance > 0 && !balanceError
  const hasFundingSource = fundingSourceType != null
  const formattedPreview = hasValidBalance ? formatter.format(parsedBalance) : null

  const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
    const raw = event.target.value
    dispatch(setStartingFundsInput(raw))
    setError(null)

    const parsed = parseFloat(raw)
    if (Number.isNaN(parsed)) {
      dispatch(setStartingFunds(null))
      return
    }

    dispatch(setStartingFunds(parsed))
  }

  const handleFundingSourceChange = (value: string): void => {
    dispatch(setFundingSourceType(value as FundingSourceType))
    setFundingSourceError(null)
  }

  const handleContinue = async (): Promise<void> => {
    if (balanceError) return

    if (startingFunds == null) {
      setError('Please enter your starting funds before continuing.')
      return
    }

    if (fundingSourceType == null) {
      setFundingSourceError('Please choose where these funds are currently stored.')
      return
    }

    setError(null)
    setFundingSourceError(null)
    try {
      await handleRequest(() =>
        updateProgress({
          currentStep: 'BALANCE' as OnboardingStep,
          startingFunds,
          fundingSourceType,
        }).unwrap(),
      )
      dispatch(setCurrentStep('BUDGET'))
      navigate(ONBOARDING_STEP_ROUTE_MAP['BUDGET'])
    } catch (err) {
      console.error('Balance setup failed:', err)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6 pb-28 sm:pb-10">
        <div className="space-y-2">
          <Input
            label="Starting funds"
            type="number"
            inputMode="decimal"
            value={startingFundsInput}
            onChange={handleChange}
            placeholder="0.00"
            endAdornment="PHP"
            min="0"
            step="0.01"
            error={balanceError ?? undefined}
            aria-label="Starting funds in Philippine Peso"
          />

          <div className="min-h-5 pl-1">
            {formattedPreview ? (
              <p className="text-sm font-medium leading-none text-foreground tabular-nums">
                {formattedPreview}
              </p>
            ) : null}
          </div>
        </div>

        <Select
          label="Where is this money stored?"
          options={FUNDING_SOURCE_OPTIONS}
          value={fundingSourceType ?? undefined}
          onChange={handleFundingSourceChange}
          error={fundingSourceError ?? undefined}
          helperText={
            fundingSourceType
              ? FUNDING_SOURCE_HELP_TEXT[fundingSourceType]
              : 'Choose the source that currently holds your available money.'
          }
          placeholder="Select a funding source"
        />

        <div className="flex items-start gap-2.5 rounded-xl border border-ui-border-subtle bg-ui-surface-muted px-4 py-3.5">
          <svg
            className="mt-0.5 h-4 w-4 shrink-0 text-subtle-foreground"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="3"
              y="7"
              width="10"
              height="8"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <path
              d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <circle cx="8" cy="11" r="1" fill="currentColor" />
          </svg>
          <p className="text-xs leading-5 text-subtle-foreground">
            Kaizen uses this starting snapshot to personalize your first budget setup. You can
            refine how your money is organized later.
          </p>
        </div>

        {onboardingError ? (
          <OnboardingErrorBlock
            error={onboardingError}
            onRetry={retry}
            isRetryDisabled={isRetryDisabled}
          />
        ) : null}

        {error ? (
          <p className={typography['body-sm']} role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-ui-border-subtle bg-background/95 px-5 py-4 backdrop-blur-sm sm:relative sm:inset-auto sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
        <Button
          className="h-12 w-full rounded-xl text-base font-semibold sm:h-10 sm:rounded-md sm:text-sm"
          onClick={handleContinue}
          isLoading={isLoading}
          disabled={Boolean(balanceError) || !hasValidBalance || !hasFundingSource}
        >
          Continue to budgets
        </Button>
      </div>
    </>
  )
}
