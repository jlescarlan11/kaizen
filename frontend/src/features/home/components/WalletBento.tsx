import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useGetPaymentMethodSummaryQuery } from '../../../app/store/api/paymentMethodApi'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { cn } from '../../../shared/lib/cn'
import { DashboardCard, CardSkeleton } from '../../../shared/components'

export const WalletBento: React.FC = () => {
  const navigate = useNavigate()
  const { data: accounts = [], isLoading } = useGetPaymentMethodSummaryQuery()

  const totalLiquidity = accounts.reduce((acc, curr) => acc + curr.totalAmount, 0)

  if (isLoading) {
    return (
      <CardSkeleton className="flex flex-col gap-3 h-full">
        <div className="h-3 w-28 bg-surface-secondary rounded" />
        <div className="h-2 w-full bg-surface-secondary rounded-full" />
        <div className="grid grid-cols-2 gap-3 flex-1">
          <div className="bg-surface-secondary rounded-xl" />
          <div className="bg-surface-secondary rounded-xl" />
        </div>
      </CardSkeleton>
    )
  }

  return (
    <DashboardCard className="flex flex-col group h-full overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-2xs font-semibold uppercase tracking-wide text-text-secondary">
          Connected Wallets
        </h4>
        <span className="text-3xs font-medium text-text-secondary bg-surface-secondary px-2 py-0.5 rounded-full">
          {accounts.length} Active
        </span>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <p className="text-3xs font-medium text-text-tertiary/60">Liquidity Split</p>
          <p className="text-2xs font-semibold text-text-primary tabular-nums">
            ${totalLiquidity.toLocaleString()}
          </p>
        </div>
        <div className="h-2 w-full bg-surface-secondary rounded-full overflow-hidden flex">
          {accounts.map((acc, i) => {
            const percentage = totalLiquidity > 0 ? (acc.totalAmount / totalLiquidity) * 100 : 0
            if (percentage < 1) return null
            const colors = ['bg-primary', 'bg-info', 'bg-success', 'bg-text-tertiary']
            return (
              <div
                key={acc.paymentMethod?.id}
                className={cn(
                  'h-full transition-all duration-1000 ease-out',
                  colors[i % colors.length],
                )}
                style={{ width: `${percentage}%` }}
                title={`${acc.paymentMethod?.name}: ${Math.round(percentage)}%`}
              />
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {accounts.slice(0, 3).map((acc) => {
          if (!acc.paymentMethod) return null
          return (
            <div
              key={acc.paymentMethod.id}
              className="flex items-center gap-3 p-3 rounded-xl bg-surface-secondary/50 border border-border-subtle hover:bg-surface-secondary transition-all cursor-pointer"
              onClick={() => navigate('/your-account/payment-methods')}
            >
              <div className="h-8 w-8 rounded-lg flex items-center justify-center text-white bg-primary shrink-0">
                <SharedIcon type="category" name="wallet" size={15} />
              </div>
              <div className="overflow-hidden min-w-0">
                <p className="text-sm font-medium text-text-primary leading-tight truncate">
                  {acc.paymentMethod.name}
                </p>
                <p className="text-2xs font-semibold text-text-secondary tabular-nums">
                  ${acc.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          )
        })}
        <button
          onClick={() => navigate('/your-account/payment-methods')}
          className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-border text-text-tertiary hover:border-primary/40 hover:text-primary transition-all"
        >
          <SharedIcon type="category" name="plus" size={14} />
          <span className="text-2xs font-medium">Link New</span>
        </button>
      </div>
    </DashboardCard>
  )
}
