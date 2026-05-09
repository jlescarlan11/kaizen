import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { useSpendingAnalytics } from '../hooks/useSpendingAnalytics'
import { SharedIcon } from '../../../shared/components/IconRegistry'

export const SpendingGraphCard: React.FC = () => {
  const { data, totalSpending, isLoading } = useSpendingAnalytics(30)
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <div className="p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm animate-pulse flex flex-col gap-3 h-full">
        <div className="h-3 w-28 bg-surface-secondary rounded" />
        <div className="h-6 w-24 bg-surface-secondary rounded" />
        <div className="flex-1 w-full bg-surface-secondary rounded" />
      </div>
    )
  }

  return (
    <div className="p-5 rounded-2xl bg-surface border border-border-subtle shadow-sm flex flex-col group h-full overflow-hidden">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <SharedIcon type="ui" name="chart-bar" size={14} className="text-primary" />
          <p className="text-[11px] font-semibold uppercase tracking-wide text-text-secondary">
            30-Day Spending
          </p>
        </div>
        <div className="flex items-center gap-1 bg-primary/10 px-2 py-0.5 rounded-full">
          <SharedIcon type="ui" name="trending-up" size={10} className="text-primary" />
          <span className="text-[10px] font-semibold text-primary">Active</span>
        </div>
      </div>

      <div className="mb-3">
        <p className="text-[11px] font-medium text-text-secondary/60 mb-0.5">Total Out (L30D)</p>
        <p className="text-2xl font-bold text-text-primary tracking-tight tabular-nums">
          ${totalSpending.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.15} />
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--color-border-subtle)"
            />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 9, fill: 'var(--color-text-tertiary)', fontWeight: 500 }}
              interval={6}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--color-text-primary)',
                borderRadius: '10px',
                padding: '6px 10px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                border: 'none',
              }}
              itemStyle={{ color: 'var(--color-primary)', fontSize: '12px', fontWeight: '600' }}
              labelStyle={{
                color: 'rgba(255,255,255,0.5)',
                fontSize: '10px',
                fontWeight: '500',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '2px',
              }}
              cursor={{ stroke: 'var(--color-primary)', strokeWidth: 1, strokeDasharray: '4 4' }}
              formatter={(value: unknown) => {
                const amount = typeof value === 'number' ? value : Number(value || 0)
                return [`$${amount.toLocaleString()}`, 'Spent']
              }}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="var(--color-primary)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSpending)"
              animationDuration={1200}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex justify-between items-center border-t border-border-subtle pt-3">
        <div className="flex items-center gap-1.5 text-text-tertiary">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span className="text-[11px] font-medium">Current Volume</span>
        </div>
        <button
          onClick={() => navigate('/insights')}
          className="text-[11px] font-medium text-primary hover:underline"
        >
          View Trends →
        </button>
      </div>
    </div>
  )
}
