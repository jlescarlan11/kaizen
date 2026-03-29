import { useState, type ReactElement } from 'react'
import { Card } from '../../shared/components/Card'
import { Button } from '../../shared/components/Button'
import { ResponsiveModal } from '../../shared/components/ResponsiveModal'
import {
  useDeletePaymentMethodMutation,
  useGetPaymentMethodTransactionCountQuery,
} from '../../app/store/api/paymentMethodApi'
import type { PaymentMethod } from './types'

interface PaymentMethodListProps {
  paymentMethods: PaymentMethod[]
  isLoading: boolean
}

export function PaymentMethodList({
  paymentMethods,
  isLoading,
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
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <p>No payment methods found.</p>
      </div>
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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ui-surface-muted text-foreground font-bold">
                {pm.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-foreground">{pm.name}</p>
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
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

  const handleDelete = async () => {
    try {
      await deletePaymentMethod(pm.id).unwrap()
      onClose()
    } catch (err) {
      const error = err as { data?: { message?: string }; message?: string }
      setError(error.data?.message || error.message || 'Failed to delete payment method.')
    }
  }

  return (
    <ResponsiveModal open={true} onClose={onClose} title={`Delete ${pm.name}?`}>
      <div className="space-y-4">
        {isLoadingCount ? (
          <div className="h-4 w-full animate-pulse bg-ui-surface-muted rounded" />
        ) : (
          <p className="text-muted-foreground">
            Are you sure you want to delete this payment method?
            {count && count > 0 ? (
              <span className="block mt-2 font-medium text-amber-600 dark:text-amber-500">
                Warning: {count} transaction{count > 1 ? 's' : ''} currently reference this method.
                Deleting it will leave these transactions without an assigned method.
              </span>
            ) : (
              <span className="block mt-2">No transactions currently reference this method.</span>
            )}
          </p>
        )}

        {error && <p className="text-sm text-ui-error text-center font-medium">{error}</p>}

        <div className="flex gap-3 pt-4">
          <Button variant="ghost" className="flex-1" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            className="flex-1 bg-ui-error hover:bg-ui-error-hover text-white border-0"
            onClick={handleDelete}
            isLoading={isDeleting}
            disabled={isLoadingCount}
          >
            Delete
          </Button>
        </div>
      </div>
    </ResponsiveModal>
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
