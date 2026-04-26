import { type ReactElement } from 'react'
import { Trash2 } from 'lucide-react'
import { DestructiveActionDialog } from '../../../shared/components/DestructiveActionDialog'

interface ConfirmBulkDeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  count: number
  isLoading?: boolean
}

/**
 * Thin wrapper around DestructiveActionDialog — see U-FRM-8.
 * Transactions retain UndoSnackbar post-delete; this dialog is the pre-delete gate — see UNDO_POLICY.md.
 */
export function ConfirmBulkDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  count,
  isLoading = false,
}: ConfirmBulkDeleteDialogProps): ReactElement {
  return (
    <DestructiveActionDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Transactions?"
      description={
        <>
          Are you sure you want to delete{' '}
          <span className="font-semibold text-foreground">{count}</span> selected{' '}
          {count === 1 ? 'transaction' : 'transactions'}?
        </>
      }
      warning={
        <p className="font-semibold uppercase tracking-wider flex items-center gap-2">
          <Trash2 className="h-3 w-3 shrink-0" />
          This action cannot be undone
        </p>
      }
      confirmLabel={`Delete ${count} ${count === 1 ? 'Transaction' : 'Transactions'}`}
      cancelLabel="Cancel"
      isConfirming={isLoading}
    />
  )
}
