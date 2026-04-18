import { type ReactElement } from 'react'
import { ResponsiveModal } from '../../../shared/components/ResponsiveModal'
import { Button } from '../../../shared/components/Button'
import { Trash2 } from 'lucide-react'

interface ConfirmBulkDeleteDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  count: number
  isLoading?: boolean
}

export function ConfirmBulkDeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  count,
  isLoading = false,
}: ConfirmBulkDeleteDialogProps): ReactElement {
  return (
    <ResponsiveModal
      open={isOpen}
      onClose={onClose}
      title="Delete Transactions?"
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
            className="w-full md:w-auto bg-ui-error! hover:bg-ui-error-hover! text-white! border-none!"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete {count} {count === 1 ? 'Transaction' : 'Transactions'}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Are you sure you want to delete <span className="font-bold text-foreground">{count}</span>{' '}
          selected {count === 1 ? 'transaction' : 'transactions'}?
        </p>
        <div className="p-3 bg-ui-error/10 border border-ui-error/20 rounded-lg">
          <p className="text-xs font-bold text-ui-error uppercase tracking-wider flex items-center gap-2">
            <Trash2 className="h-3 w-3" />
            This action cannot be undone
          </p>
        </div>
      </div>
    </ResponsiveModal>
  )
}
