import { useState, type ReactElement } from 'react'
import {
  useSkipBudgetSetupMutation,
  useCompleteOnboardingMutation,
} from '../../../app/store/api/authApi'
import { useAuthState } from '../../../shared/hooks/useAuthState'
import { useAppSelector } from '../../../app/store/hooks'
import { typography } from '../../../shared/styles/typography'
import { selectBalanceValue, selectFundingSourceType } from '../../onboarding/onboardingSlice'
import { useNavigate } from 'react-router-dom'
import { ResponsiveModal } from '../../../shared/components/ResponsiveModal'
import { Button } from '../../../shared/components/Button'
import { clearStoredOnboardingDraft } from '../../onboarding/onboardingDraftStorage'

interface SkipBudgetTriggerProps {
  className?: string
  onSkipped?: () => void
}

export function SkipBudgetTrigger({ className, onSkipped }: SkipBudgetTriggerProps): ReactElement {
  const { user } = useAuthState()
  const reduxBalance = useAppSelector(selectBalanceValue)
  const fundingSourceType = useAppSelector(selectFundingSourceType)
  const balance = reduxBalance ?? user?.balance ?? 0

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [skipBudgetSetup, { isLoading }] = useSkipBudgetSetupMutation()
  const [complete] = useCompleteOnboardingMutation()
  const navigate = useNavigate()

  const openDialog = () => setIsDialogOpen(true)
  const closeDialog = () => {
    setIsDialogOpen(false)
    setServerError(null)
  }

  const handleConfirm = async () => {
    setServerError(null)
    try {
      await skipBudgetSetup({ skip: true }).unwrap()
      if (user && !user.onboardingCompleted) {
        if (!fundingSourceType) {
          setServerError('Choose a funding source before skipping budget setup.')
          return
        }
        await complete({ startingFunds: balance, fundingSourceType }).unwrap()
        clearStoredOnboardingDraft(user.id)
      }
      onSkipped?.()
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Skip preference update failed:', error)
      setServerError('Unable to skip budget setup right now. Please try again.')
    }
  }

  return (
    <>
      <button
        type="button"
        className={`${className ?? ''} text-sm font-medium leading-none text-muted-foreground transition-colors hover:text-foreground`}
        onClick={openDialog}
      >
        Skip for now
      </button>

      <ResponsiveModal
        title="Skip budget setup?"
        open={isDialogOpen}
        onClose={closeDialog}
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={closeDialog} disabled={isLoading}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} isLoading={isLoading}>
              Confirm skip
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <p className={typography['body-sm']}>
            Skipping now stores the preference on your account. You can always come back from the
            dashboard to complete the setup later.
          </p>
          {serverError ? (
            <p className={typography['body-sm']} role="alert">
              {serverError}
            </p>
          ) : null}
        </div>
      </ResponsiveModal>
    </>
  )
}
