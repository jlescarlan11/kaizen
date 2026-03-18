import { type ReactElement } from 'react'
import { ResponsiveModal } from './ResponsiveModal'
import { Button } from './Button'

interface LogoutConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
}

/**
 * LogoutConfirmationModal: A confirmation dialog for the logout action.
 * Adheres to PRD Acceptance Criterion 2 and technical constraints for no additional form fields.
 */
export function LogoutConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: LogoutConfirmationModalProps): ReactElement {
  return (
    <ResponsiveModal
      open={isOpen}
      onClose={onClose}
      title="Log out of Kaizen?"
      footer={
        <div className="flex flex-col-reverse md:flex-row md:justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
            className="w-full md:w-auto"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            isLoading={isLoading}
            className="w-full md:w-auto bg-[var(--ui-danger-bg)]! hover:bg-[var(--ui-danger-bg-hover)]! text-[var(--ui-danger-text)]! border-none!"
          >
            Log out
          </Button>
        </div>
      }
    >
      <p className="text-muted-foreground text-sm leading-relaxed">
        You'll need to sign back in to access your account and workspace. Any unsaved changes may be
        lost.
      </p>
    </ResponsiveModal>
  )
}
