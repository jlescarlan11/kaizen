import { useState, useMemo, type ChangeEvent } from 'react'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { Modal } from '../../../shared/components/Modal'
import { useReconcileBalanceMutation } from '../../../app/store/api/transactionApi'
import { useCurrencyFormatter } from '../../../shared/hooks/useCurrencyFormatter'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

import { useAppDispatch } from '../../../app/store/hooks'
import { showAlert } from '../../../app/store/notificationSlice'
import { SystemMessages } from '../utils/errorMessages'

interface ReconciliationModalProps {
  isOpen: boolean
  onClose: () => void
  currentBalance: number
}

export function ReconciliationModal({ isOpen, onClose, currentBalance }: ReconciliationModalProps) {
  const dispatch = useAppDispatch()
  const [realWorldBalance, setRealWorldBalance] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [reconcile, { isLoading }] = useReconcileBalanceMutation()
  const currencyFormatter = useCurrencyFormatter()

  const difference = useMemo(() => {
    const val = parseFloat(realWorldBalance)
    if (isNaN(val)) return 0
    return val - currentBalance
  }, [realWorldBalance, currentBalance])

  const handleReconcile = async () => {
    const val = parseFloat(realWorldBalance)
    if (isNaN(val)) return

    try {
      await reconcile({
        realWorldBalance: val,
        description: description || undefined,
      }).unwrap()

      if (difference === 0) {
        dispatch(
          showAlert({
            title: 'Info',
            message: 'Balances already match. No adjustment needed.',
            type: 'info',
          }),
        )
      } else {
        dispatch(
          showAlert({
            ...SystemMessages.SUCCESS,
            message: `Balance reconciled. Adjustment of ${currencyFormatter.format(Math.abs(difference))} applied.`,
            type: 'success',
            dataSaved: true,
          }),
        )
      }
      onClose()
      setRealWorldBalance('')
      setDescription('')
    } catch (err: unknown) {
      console.error('Failed to reconcile balance:', err)
      const error = err as { data?: { message?: string } }
      dispatch(
        showAlert({
          title: 'Error',
          message: error.data?.message || 'Failed to reconcile balance. Please try again.',
          type: 'error',
          dataSaved: false,
        }),
      )
    }
  }

  const footer = (
    <div className="flex justify-end gap-3 mt-6">
      <Button variant="ghost" onClick={onClose} disabled={isLoading}>
        Cancel
      </Button>
      <Button
        onClick={handleReconcile}
        disabled={
          isLoading ||
          !realWorldBalance ||
          (parseFloat(realWorldBalance) === currentBalance && difference === 0)
        }
      >
        {isLoading ? 'Reconciling...' : 'Confirm Adjustment'}
      </Button>
    </div>
  )

  return (
    <Modal open={isOpen} onClose={onClose} title="Reconcile Balance" footer={footer}>
      <div className="space-y-4">
        <p className="text-sm text-subtle-foreground">
          Enter your actual account balance to resolve any discrepancies.
        </p>

        <div className="flex flex-col gap-2 rounded-lg border border-ui-border bg-ui-surface-muted p-4">
          <span className="text-xs font-medium text-subtle-foreground uppercase tracking-wider">
            Current App Balance
          </span>
          <span className="text-2xl font-bold text-foreground">
            {currencyFormatter.format(currentBalance)}
          </span>
        </div>

        <Input
          id="realWorldBalance"
          label="Real-world Balance"
          type="number"
          step="0.01"
          value={realWorldBalance}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setRealWorldBalance(e.target.value)}
          placeholder="0.00"
          autoFocus
        />

        <Input
          id="description"
          label="Adjustment Note (Optional)"
          value={description}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
          placeholder="e.g., Bank fee correction"
        />

        {realWorldBalance && (
          <div
            className={`flex items-center gap-3 rounded-md p-3 text-sm ${
              difference === 0
                ? 'bg-ui-success/10 text-ui-success'
                : 'bg-ui-warning/10 text-ui-warning'
            }`}
          >
            {difference === 0 ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Balances match perfectly!</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4" />
                <span>
                  Difference: {difference > 0 ? '+' : ''}
                  {currencyFormatter.format(difference)}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
