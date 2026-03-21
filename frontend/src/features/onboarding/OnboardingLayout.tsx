import { type PropsWithChildren, type ReactElement, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../shared/components/Button'
import { ResponsiveModal } from '../../shared/components/ResponsiveModal'
import { useAppDispatch, useAppSelector } from '../../app/store/hooks'
import { useDeleteOnboardingProgressMutation, useLogoutMutation } from '../../app/store/api/authApi'
import { goToPreviousStep, resetOnboardingState, selectCurrentStep } from './onboardingSlice'
import { getPreviousStep, ONBOARDING_STEP_ROUTE_MAP } from './onboardingStep'

const LOGOUT_CONFIRMATION_COPY = 'Progress will be lost. Log out?' // PRD Story 20 copy; confirm if wording must change.

export function OnboardingLayout({ children }: PropsWithChildren): ReactElement {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const currentStep = useAppSelector(selectCurrentStep)
  const previousStep = getPreviousStep(currentStep)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isProcessingLogout, setIsProcessingLogout] = useState(false)
  const [deleteProgress] = useDeleteOnboardingProgressMutation()
  const [logout] = useLogoutMutation()

  const stepLabel = useMemo(() => {
    return `Step ${currentStep === 'BUDGET' ? 2 : 1} of 2`
  }, [currentStep])

  const handleBack = (): void => {
    if (!previousStep) {
      return
    }
    dispatch(goToPreviousStep())
    navigate(ONBOARDING_STEP_ROUTE_MAP[previousStep])
  }

  const handleConfirmLogout = async (): Promise<void> => {
    setIsProcessingLogout(true)
    dispatch(resetOnboardingState())
    // Delete progress before invalidating the session to avoid orphaned data (PRD Open Question 4).
    try {
      await deleteProgress().unwrap()
    } catch (error) {
      console.error('Failed to delete onboarding progress before logout:', error)
    }
    try {
      await logout().unwrap()
    } catch (error) {
      console.error('Logout failed after deleting progress:', error)
    } finally {
      setIsProcessingLogout(false)
      navigate('/signin', { replace: true })
    }
  }

  return (
    <div className="min-h-[100vh] bg-background">
      <header className="border-b border-ui-border bg-ui-surface px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">
              Onboarding
            </p>
            <p className="text-lg font-semibold text-foreground">{stepLabel}</p>
          </div>
          <div className="flex items-center gap-3">
            {previousStep && (
              <Button variant="ghost" onClick={handleBack} className="text-foreground">
                Back
              </Button>
            )}
            <Button variant="ghost" onClick={() => setIsModalOpen(true)}>
              Log out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-10">{children}</main>

      <ResponsiveModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={LOGOUT_CONFIRMATION_COPY}
        className="max-w-sm"
        footer={
          <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-end">
            <Button
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
              disabled={isProcessingLogout}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmLogout}
              isLoading={isProcessingLogout}
              className="border-none bg-[var(--ui-destructive-bg)]! hover:bg-[var(--ui-destructive-bg-hover)]! text-[var(--ui-destructive-text)]!"
            >
              Log out
            </Button>
          </div>
        }
      >
        <p className="text-sm text-muted-foreground">Progress will be lost. Log out?</p>
      </ResponsiveModal>
    </div>
  )
}
