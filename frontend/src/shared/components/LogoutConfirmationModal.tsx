import { type ReactElement } from 'react'
import { DestructiveActionDialog } from './DestructiveActionDialog'

interface LogoutConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isLoading?: boolean
}

/**
 * LogoutConfirmationModal: A confirmation dialog for the logout action.
 * Adheres to PRD Acceptance Criterion 2 and technical constraints for no additional form fields.
 *
 * Thin wrapper around DestructiveActionDialog — see U-FRM-8.
 * No undo by design — see UNDO_POLICY.md (logout is a session action, not a delete).
 */
export function LogoutConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: LogoutConfirmationModalProps): ReactElement {
  return (
    <DestructiveActionDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Log out of Kaizen?"
      description="You'll need to sign back in to access your account and workspace. Any unsaved changes may be lost."
      confirmLabel="Log out"
      cancelLabel="Cancel"
      isConfirming={isLoading}
    />
  )
}
