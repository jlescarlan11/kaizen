import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { ADD_TRANSACTION_ROUTE } from '../routes'
import { useBalanceAnalytics } from '../hooks/useBalanceAnalytics'
import { useAppDispatch, useAppSelector } from '../../../app/store/hooks'
import { selectIsPrivacyMode, togglePrivacyMode } from '../../../app/store/uiSlice'
import { Money } from '../../../shared/components/Money/Money'

interface HomeDashboardHeaderProps {
  balance: number
}

export const HomeDashboardHeader: React.FC<HomeDashboardHeaderProps> = ({ balance }) => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const isPrivacyMode = useAppSelector(selectIsPrivacyMode)
  const { data: balanceData, isLoading: isBalanceLoading } = useBalanceAnalytics(30)

  return (
    <div className="relative w-full rounded-2xl bg-surface border border-border-subtle shadow-sm overflow-hidden p-6 md:p-8 text-center group">
      {/* Privacy Toggle */}
      <button
        onClick={() => dispatch(togglePrivacyMode())}
        className="absolute top-6 right-8 z-20 p-2 rounded-full bg-surface-secondary/50 border border-border/10 text-text-tertiary hover:text-primary transition-colors group/privacy"
        title={isPrivacyMode ? 'Show Balances' : 'Hide Balances'}
      >
        <SharedIcon type="ui" name={isPrivacyMode ? 'eye-off' : 'eye'} size={16} />
      </button>

      <div className="relative z-10 flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          <p className="text-[11px] font-medium uppercase tracking-widest text-text-secondary/60">
            Net Worth
          </p>
        </div>

        <div className="relative flex flex-col md:flex-row items-center justify-center gap-6">
          <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

          <div className="flex items-baseline justify-center gap-2">
            <h3 className="relative text-5xl md:text-7xl font-black tracking-tighter text-text-primary">
              <Money amount={balance} className="!gap-3" decimalPlaces={2} />
            </h3>
          </div>

          {!isBalanceLoading && balanceData.length > 0 && (
            <div className="w-24 h-12 md:w-32 md:h-16 opacity-40 group-hover:opacity-100 transition-all duration-500 relative min-h-[48px] md:min-h-[64px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={balanceData}>
                  <YAxis hide domain={['dataMin', 'dataMax']} />
                  <Line
                    type="monotone"
                    dataKey="balance"
                    stroke="var(--color-primary)"
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
              <p className="text-[9px] font-medium uppercase tracking-widest text-primary/70 mt-1">
                30D
              </p>
            </div>
          )}
        </div>

        {/* Quick Action Speed Dial */}
        <div className="flex items-center justify-center flex-wrap gap-2 mt-4">
          <button
            onClick={() => navigate(ADD_TRANSACTION_ROUTE)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-white text-xs font-semibold hover:brightness-105 active:scale-95 transition-all shadow-sm shadow-primary/20"
          >
            <SharedIcon type="ui" name="plus" size={14} strokeWidth={3} />
            Add Transaction
          </button>
          <button
            onClick={() => navigate('/budgets/add')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-surface-secondary border border-border-subtle text-text-secondary text-xs font-medium hover:bg-surface-secondary/80 transition-all"
          >
            <SharedIcon type="ui" name="target" size={14} strokeWidth={3} />
            New Budget
          </button>
        </div>
      </div>

      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-110 transition-all duration-1000 pointer-events-none">
        <SharedIcon type="category" name="banknote" size={120} className="text-primary rotate-12" />
      </div>
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 opacity-[0.03] group-hover:opacity-[0.07] group-hover:scale-110 transition-all duration-1000 pointer-events-none">
        <SharedIcon
          type="category"
          name="sparkles"
          size={120}
          className="text-primary -rotate-12"
        />
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface-secondary/20 to-transparent pointer-events-none" />
    </div>
  )
}
