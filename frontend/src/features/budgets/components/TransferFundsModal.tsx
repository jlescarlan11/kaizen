import React, { useState } from 'react'
import {
  useTransferFundsMutation,
  useGetBudgetSummaryQuery,
} from '../../../app/store/api/budgetApi'
import { ResponsiveModal } from '../../../shared/components/ResponsiveModal'
import { Button } from '../../../shared/components/Button'
import { Input } from '../../../shared/components/Input'
import { Select } from '../../../shared/components/Select'
import { type BudgetPeriod } from '../constants'

interface TransferFundsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const TransferFundsModal: React.FC<TransferFundsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [source, setSource] = useState<BudgetPeriod>('MONTHLY')
  const [target, setTarget] = useState<BudgetPeriod>('WEEKLY')
  const [amount, setAmount] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  const [transferFunds, { isLoading }] = useTransferFundsMutation()
  const { data: summary } = useGetBudgetSummaryQuery()

  const handleSourceChange = (val: string) => {
    const newSource = val as BudgetPeriod
    setSource(newSource)
    setTarget(newSource === 'MONTHLY' ? 'WEEKLY' : 'MONTHLY')
  }

  const handleTransfer = async () => {
    setError(null)
    const numAmount = parseFloat(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid positive amount.')
      return
    }

    try {
      await transferFunds({
        source,
        target,
        amount: numAmount,
      }).unwrap()
      onClose()
      setAmount('')
    } catch (err: unknown) {
      const errorData = err as { data?: { message?: string } }
      setError(errorData?.data?.message || 'Failed to transfer funds. Please try again.')
    }
  }

  const availableBalance = source === 'MONTHLY' 
    ? summary?.availableMonthly || 0 
    : summary?.availableWeekly || 0

  return (
    <ResponsiveModal
      open={isOpen}
      onClose={onClose}
      title="Transfer Funds"
      className="p-0"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-ui-danger/10 border border-ui-danger/20 rounded-xl text-ui-danger text-xs font-bold uppercase tracking-widest">
            {error}
          </div>
        )}

        <Select
          label="From Pool"
          value={source}
          onChange={handleSourceChange}
          options={[
            { value: 'MONTHLY', label: `Monthly Pool ($${(summary?.availableMonthly || 0).toFixed(2)})` },
            { value: 'WEEKLY', label: `Weekly Pool ($${(summary?.availableWeekly || 0).toFixed(2)})` },
          ]}
        />

        <div className="p-3 bg-secondary/10 rounded-md text-sm text-secondary-foreground">
          Transferring to <strong>{target.toLowerCase()} pool</strong>.
        </div>

        <Input
          label="Amount to Transfer"
          type="number"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0.01"
          step="0.01"
          required
        />

        <div className="flex flex-col gap-2 pt-2">
          <Button
            onClick={handleTransfer}
            isLoading={isLoading}
            disabled={!amount || parseFloat(amount) > availableBalance}
            className="w-full"
          >
            Transfer Funds
          </Button>
          <Button variant="ghost" onClick={onClose} className="w-full">
            Cancel
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  )
}
