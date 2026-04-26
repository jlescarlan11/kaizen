import { useState, type ReactElement } from 'react'
import { Card } from '../../shared/components/Card'
import { Button } from '../../shared/components/Button'
import { EmptyStateCard } from '../../shared/components/EmptyStateCard'
import { DestructiveActionDialog } from '../../shared/components/DestructiveActionDialog'
import {
  useDeletePaymentMethodMutation,
  useGetPaymentMethodTransactionCountQuery,
} from '../../app/store/api/paymentMethodApi'
import type { PaymentMethod } from './types'
import { getErrorMessage } from '../../app/store/api/errors'

interface PaymentMethodListProps {
  paymentMethods: PaymentMethod[]
  isLoading: boolean
  /** Called when the user clicks "Add Payment Method" in the empty state. Defaults to scrolling to the top of the page. */
  onAddClick?: () => void
}

export function PaymentMethodList({
  paymentMethods,
  isLoading,
  onAddClick,
}: PaymentMethodListProps): ReactElement {
  const [deletingPm, setDeletingPm] = useState<PaymentMethod | null>(null)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-ui-surface-muted" />
        ))}
      </div>
    )
  }

  if (paymentMethods.length === 0) {
    const handleAddClick = onAddClick ?? (() => window.scrollTo({ top: 0, behavior: 'smooth' }))
    return (
      <EmptyStateCard
        title="No payment methods found"
        description="Add a payment method to start tracking which accounts or cards you use."
        primaryAction={{ label: 'Add Payment Method', onClick: handleAddClick }}
      />
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paymentMethods.map((pm) => (
          <Card
            key={pm.id}
            className="group flex items-center justify-between border border-ui-border-subtle p-4 shadow-sm hover:border-primary/50 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ui-surface-muted text-foreground font-semibold">
                {pm.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-foreground">{pm.name}</p>
                <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider">
                  {pm.isGlobal ? 'System' : 'Custom'}
                </p>
              </div>
            </div>
            {!pm.isGlobal && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-ui-error hover:bg-ui-error/10 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => setDeletingPm(pm)}
              >
                <DeleteIcon />
              </Button>
            )}
          </Card>
        ))}
      </div>

      {deletingPm && (
        <DeleteConfirmationModal pm={deletingPm} onClose={() => setDeletingPm(null)} />
      )}
    </>
  )
}

/**
 * Thin wrapper around DestructiveActionDialog — see U-FRM-8.
 * No undo by design — see UNDO_POLICY.md.
 */
function DeleteConfirmationModal({
  pm,
  onClose,
}: {
  pm: PaymentMethod
  onClose: () => void
}): ReactElement {
  const { data: count, isLoading: isLoadingCount } = useGetPaymentMethodTransactionCountQuery(pm.id)
  const [deletePaymentMethod, { isLoading: isDeleting }] = useDeletePaymentMethodMutation()
  const [error, setError] = useState<string | null>(null)

  // No undo by design — see UNDO_POLICY.md.
  const handleDelete = async () => {
    try {
      await deletePaymentMethod(pm.id).unwrap()
      onClose()
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete payment method.'))
    }
  }

  const warningContent =
    !isLoadingCount && count && count > 0 ? (
      <span>
        Warning: {count} transaction{count > 1 ? 's' : ''} currently reference this method. Deleting
        it will leave these transactions without an assigned method.
      </span>
    ) : null

  return (
    <DestructiveActionDialog
      isOpen={true}
      onClose={onClose}
      onConfirm={handleDelete}
      title={`Delete ${pm.name}?`}
      description={
        isLoadingCount ? (
          <span className="block h-4 w-full animate-pulse bg-ui-surface-muted rounded" />
        ) : (
          <>
            Are you sure you want to delete this payment method?
            {!warningContent && (
              <span className="block mt-2">No transactions currently reference this method.</span>
            )}
            {error && (
              <span className="block mt-2 text-ui-error font-medium text-center">{error}</span>
            )}
          </>
        )
      }
      warning={warningContent ?? undefined}
      confirmLabel="Delete"
      cancelLabel="Cancel"
      isConfirming={isDeleting || isLoadingCount}
    />
  )
}

function DeleteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18m-2 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  )
}
