import { useState, type ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '../../../shared/components/Button'
import { Modal } from '../../../shared/components/Modal'
import { useSkipBudgetSetupMutation } from '../../../app/store/api/authApi'

interface SkipBudgetTriggerProps {
  className?: string
  onSkipped?: () => void
}

export function SkipBudgetTrigger({ className, onSkipped }: SkipBudgetTriggerProps): ReactElement {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [skipBudgetSetup, { isLoading }] = useSkipBudgetSetupMutation()
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
        className={`${className ?? ''} text-sm font-medium text-muted-foreground hover:text-foreground transition-colors`}
        onClick={openDialog}
      >
        Skip for now
      </button>

      <Modal
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
          <p className="text-sm text-muted-foreground">
            Skipping now stores the preference on your account. You can always come back from the
            dashboard to complete the setup later.
          </p>
          {serverError ? (
            <p className="text-sm text-destructive" role="alert">
              {serverError}
            </p>
          ) : null}
        </div>
      </Modal>
    </>
  )
}
