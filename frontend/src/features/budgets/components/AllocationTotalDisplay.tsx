import { useEffect } from 'react'
import type { ReactElement } from 'react'
import { computeAllocationStatus, RED_THRESHOLD } from '../allocationThresholds'
import type { AllocationStatus } from '../allocationThresholds'

const currencyFormatter = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  minimumFractionDigits: 2,
})

interface AllocationTotalDisplayProps {
  totalAllocated: number
  balance: number
  onStatusChange?: (status: AllocationStatus) => void
}

const statusColorMap: Record<AllocationStatus, string> = {
  safe: 'var(--ui-success-text)',
  high: 'var(--ui-warning-text)',
  over: 'var(--ui-danger-text)',
}

export function AllocationTotalDisplay({
  totalAllocated,
  balance,
  onStatusChange,
}: AllocationTotalDisplayProps): ReactElement {
  const sanitizedAllocated = Math.max(totalAllocated, 0)
  const ratio =
    balance > 0 ? sanitizedAllocated / balance : sanitizedAllocated === 0 ? 0 : RED_THRESHOLD

  const status = computeAllocationStatus(ratio)
  const color = statusColorMap[status]

  useEffect(() => {
    onStatusChange?.(status)
    // The PRD enforces updates within 200ms (MAX_UPDATE_LATENCY_MS); this component
    // re-renders on every prop change and never debounces so the latency requirement is met.
  }, [status, onStatusChange])

  const percentageAllocated = Math.round(ratio * 100)
  const remainder = Math.max(balance - sanitizedAllocated, 0)

  const formattedBalance = currencyFormatter.format(balance)
  const formattedTotal = currencyFormatter.format(sanitizedAllocated)
  const formattedRemainder = currencyFormatter.format(remainder)

  return (
    <div className="space-y-1">
      <p className="text-sm font-semibold tracking-tight" style={{ color }}>
        Total: {formattedTotal} / {formattedBalance} balance
      </p>
      <p className="text-sm text-muted-foreground">{percentageAllocated}% allocated</p>
      <p className="text-sm text-muted-foreground">Unallocated: {formattedRemainder}</p>
      {status === 'over' ? (
        <p className="text-sm font-medium" role="alert" style={{ color: 'var(--ui-danger-text)' }}>
          Total allocations cannot exceed your balance.
        </p>
      ) : null}
    </div>
  )
}
