import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react'
import { Button } from '../../shared/components/Button'
import { Input } from '../../shared/components/Input'
import { ResponsiveModal } from '../../shared/components/ResponsiveModal'
import { validateBalance } from '../../shared/lib/validation'
import { useUpdateBalanceMutation } from '../../app/store/api/authApi'

interface BalanceEditorProps {
  open: boolean
  onClose: () => void
  currentBalance: number
}

export function BalanceEditor({ currentBalance, onClose, open }: BalanceEditorProps): ReactElement {
  const [balanceField, setBalanceField] = useState(currentBalance.toFixed(2))
  const [serverError, setServerError] = useState<string | null>(null)
  const [updateBalance, { isLoading }] = useUpdateBalanceMutation()

  const resetEditorState = useCallback(() => {
    setBalanceField(currentBalance.toFixed(2))
    setServerError(null)
  }, [currentBalance])

  // Sync the form with the current balance when the editor opens.
  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- necessary to keep the modal synced with the stored balance when it opens
      resetEditorState()
    }
  }, [open, resetEditorState])

  // Instruction 5 requires us to reuse the shared validation rules defined in `validateBalance`.
  const validationError = useMemo(() => validateBalance(balanceField), [balanceField])

  const handleSave = async () => {
    if (validationError) return

    const parsedValue = parseFloat(balanceField)
    if (Number.isNaN(parsedValue)) {
      setServerError('Balance must be a valid number.')
      return
    }

    try {
      await updateBalance({ openingBalance: parsedValue }).unwrap()
      onClose()
    } catch (error) {
      console.error('Balance update failed:', error)
      setServerError('Unable to save balance. Please try again.')
    }
  }

  const handleCancel = () => {
    setBalanceField(currentBalance.toFixed(2))
    setServerError(null)
    // Cancel is intentionally a no-op on the backend.
    onClose()
  }

  return (
    <ResponsiveModal
      className="bg-ui-surface"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} isLoading={isLoading} disabled={Boolean(validationError)}>
            Save
          </Button>
        </div>
      }
      onClose={handleCancel}
      open={open}
      title="Edit balance"
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Update your current balance without having to restart onboarding.
        </p>
        <Input
          autoFocus
          endAdornment="PHP"
          helperText="Values are stored as PHP."
          min="0"
          placeholder="0.00"
          startAdornment="₱"
          step="0.01"
          type="number"
          value={balanceField}
          onChange={(event) => setBalanceField(event.target.value)}
          error={validationError ?? undefined}
        />
        {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}
      </div>
    </ResponsiveModal>
  )
}
