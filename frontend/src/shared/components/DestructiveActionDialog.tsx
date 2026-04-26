import { type ReactElement, type ReactNode } from 'react'
import { ResponsiveModal } from './ResponsiveModal'
import { Button } from './Button'

export interface DestructiveActionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void | Promise<void>
  title: string
  description?: ReactNode
  /** Optional warning box content; renders in danger-toned card if provided. */
  warning?: ReactNode
  /** Default: "Delete" */
  confirmLabel?: string
  /** Default: "Cancel" */
  cancelLabel?: string
  /** Shows a loading spinner on the destructive button when true. */
  isConfirming?: boolean
}

/**
 * DestructiveActionDialog — shared primitive for all destructive-action confirmations.
 *
 * Wraps ResponsiveModal with a consistent layout:
 * - Title rendered by ResponsiveModal's h3 DialogTitle
 * - Optional description in body-sm style
 * - Optional warning slot rendered as a role="alert" danger card
 * - Footer: Cancel (left) + destructive Button (right)
 *
 * U-FRM-8: centralises the three previously-divergent confirmation layouts
 * (LogoutConfirmationModal, ConfirmBulkDeleteDialog, PaymentMethodList inline modal).
 */
export function DestructiveActionDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  warning,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  isConfirming = false,
}: DestructiveActionDialogProps): ReactElement {
  return (
    <ResponsiveModal
      open={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <div className="flex flex-col-reverse md:flex-row md:justify-end gap-3">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isConfirming}
            className="w-full md:w-auto"
          >
            {cancelLabel}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            isLoading={isConfirming}
            className="w-full md:w-auto"
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {description && (
          <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
        )}
        {warning && (
          <div
            role="alert"
            className="p-3 bg-ui-danger-subtle border border-ui-border rounded-lg text-ui-danger-text text-xs leading-relaxed"
          >
            {warning}
          </div>
        )}
      </div>
    </ResponsiveModal>
  )
}
