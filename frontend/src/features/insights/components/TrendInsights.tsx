import type { ReactElement } from 'react'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import type { BalanceTrendSeries } from '../types'
import { generateInsights, type Insight } from '../utils/insightGenerator'

interface TrendInsightsProps {
  trends: BalanceTrendSeries
  isLoading: boolean
}

export function TrendInsights({ trends, isLoading }: TrendInsightsProps): ReactElement {
  if (isLoading) {
    return (
      <div className="p-4 rounded-2xl bg-ui-surface-muted/30 animate-pulse space-y-3">
        <div className="h-4 w-32 rounded bg-black/5" />
        <div className="h-3 w-full rounded bg-black/5" />
      </div>
    )
  }

  const insights = generateInsights(trends.series)

  if (insights.length === 0) {
    return (
      <div className="p-4 rounded-2xl border border-dashed border-ui-border-subtle bg-ui-surface/20 flex items-center justify-center">
        <p className="text-xs text-muted-foreground italic">No significant trends detected.</p>
      </div>
    )
  }

  return (
    <div className="p-4 rounded-2xl border border-ui-border-subtle bg-ui-surface shadow-sm space-y-4">
      <div className="flex items-center gap-2 px-1">
        <SharedIcon type="ui" name="insight" size={14} className="text-primary" />
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
          Key Observations
        </h3>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {insights.map((insight, index) => (
          <InsightItem key={index} insight={insight} />
        ))}
      </div>
    </div>
  )
}

function InsightItem({ insight }: { insight: Insight }) {
  const config = {
    trend: { icon: 'trend', color: 'text-blue-500', bg: 'bg-blue-500/5' },
    anomaly: { icon: 'expense', color: 'text-error', bg: 'bg-error/5' },
    success: { icon: 'income', color: 'text-success', bg: 'bg-success/5' },
  }[insight.type]

  return (
    <div
      className={`flex gap-3 p-3 rounded-xl ${config.bg} border border-transparent hover:border-ui-border-subtle transition-all duration-300 animate-in fade-in slide-in-from-bottom-1`}
    >
      <div
        className={`p-1.5 rounded-lg bg-ui-surface shadow-sm shrink-0 flex items-center justify-center h-7 w-7`}
      >
        <SharedIcon
          type="ui"
          name={config.icon as 'trend' | 'expense' | 'income'}
          size={12}
          className={config.color}
        />
      </div>
      <p className="text-xs font-semibold text-foreground/90 leading-snug">{insight.message}</p>
    </div>
  )
}
