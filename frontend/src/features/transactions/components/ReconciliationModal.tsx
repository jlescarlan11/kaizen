import { useState, useMemo } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/shared/components/ui/dialog'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { useReconcileBalanceMutation } from '../../../app/store/api/transactionApi'
import { useCurrencyFormatter } from '@/shared/hooks/useCurrencyFormatter'
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Reconcile Balance</DialogTitle>
          <DialogDescription>
            Enter your actual account balance to resolve any discrepancies.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="flex flex-col gap-2 rounded-lg border border-ui-border-subtle bg-ui-surface-subtle p-4">
            <span className="text-xs font-medium text-subtle-foreground uppercase tracking-wider">
              Current App Balance
            </span>
            <span className="text-2xl font-bold text-foreground">
              {currencyFormatter.format(currentBalance)}
            </span>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="realWorldBalance">Real-world Balance</Label>
            <Input
              id="realWorldBalance"
              type="number"
              step="0.01"
              value={realWorldBalance}
              onChange={(e) => setRealWorldBalance(e.target.value)}
              placeholder="0.00"
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Adjustment Note (Optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Bank fee correction"
            />
          </div>

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

        <DialogFooter>
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
