import { useEffect, useMemo } from 'react'
import type { CSSProperties, ReactElement } from 'react'
import { computeAllocationStatus, RED_THRESHOLD } from '../allocationThresholds'
import type { AllocationStatus } from '../allocationThresholds'
import { ProgressBar } from '../../../shared/components/ProgressBar'

import { formatCurrency } from '../../../shared/lib/formatCurrency'

const currencyFormatter = {
  format: (amount: number) =>
    formatCurrency(amount, { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
}

const currencyFormatterFull = {
  format: (amount: number) =>
    formatCurrency(amount, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
}

interface AllocationTotalDisplayProps {
  totalAllocated: number
  balance: number
  onStatusChange?: (status: AllocationStatus) => void
}

const barColorMap: Record<AllocationStatus, string> = {
  safe: 'bg-primary',
  high: '',
  over: 'bg-ui-danger-bg',
}

const allocatedColorMap: Record<AllocationStatus, string> = {
  safe: 'text-ui-accent-text',
  high: 'text-ui-warning-text',
  over: 'text-ui-danger-text-soft',
}

const warningGradientStyle: CSSProperties = {
  backgroundImage: 'linear-gradient(90deg, var(--ui-action-bg) 0%, var(--ui-warning-bg) 100%)',
}

export function AllocationTotalDisplay({
  totalAllocated,
  balance,
  onStatusChange,
}: AllocationTotalDisplayProps): ReactElement {
  const sanitizedAllocated = Math.max(totalAllocated, 0)

  const ratio = useMemo(
    () =>
      balance > 0 ? sanitizedAllocated / balance : sanitizedAllocated === 0 ? 0 : RED_THRESHOLD,
    [balance, sanitizedAllocated],
  )

  const status = computeAllocationStatus(ratio)
  const isOver = status === 'over'
  const remainder = Math.max(balance - sanitizedAllocated, 0)
  const barPercent = Math.min(ratio * 100, 100)
  const percentLabel =
    ratio >= 1 || remainder === 0
      ? '100'
      : (Math.floor(ratio * 1000) / 10).toFixed(1).replace(/\.0$/, '')
  const activeBarStyle = status === 'high' ? warningGradientStyle : undefined

  useEffect(() => {
    onStatusChange?.(status)
  }, [status, onStatusChange])

  return (
    <div className="space-y-3">
      <ProgressBar
        value={barPercent}
        activeClassName={barColorMap[status]}
        activeStyle={activeBarStyle}
        inactiveClassName="bg-ui-surface-muted"
        aria-label="Budget allocation"
      />

      <div className="flex items-center justify-between text-xs tabular-nums">
        <span className={`font-semibold ${allocatedColorMap[status]}`}>
          {currencyFormatter.format(sanitizedAllocated)} allocated
          <span className="ml-1.5 font-normal opacity-70">({percentLabel}%)</span>
        </span>
        <span className="text-ui-text-subtle">
          {isOver ? (
            <span className="font-medium text-ui-danger-text-soft">
              Over by {currencyFormatter.format(sanitizedAllocated - balance)}
            </span>
          ) : (
            <>{currencyFormatter.format(remainder)} left</>
          )}
        </span>
      </div>

      <p className="text-xs text-ui-text-subtle">
        of {currencyFormatterFull.format(balance)} total balance
      </p>

      {isOver ? (
        <div
          className="flex items-center gap-2 rounded-lg bg-ui-danger-subtle px-3 py-2.5"
          role="alert"
        >
          <svg
            className="h-3.5 w-3.5 shrink-0 text-ui-danger-text-soft"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M7 1L13 12H1L7 1Z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            <line
              x1="7"
              y1="5.5"
              x2="7"
              y2="8.5"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <circle cx="7" cy="10.5" r="0.6" fill="currentColor" />
          </svg>
          <p className="text-xs font-medium text-ui-danger-text-soft">
            Total allocations cannot exceed your balance.
          </p>
        </div>
      ) : null}
    </div>
  )
}
