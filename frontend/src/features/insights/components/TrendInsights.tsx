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
      <div className="py-4 space-y-3 animate-pulse">
        <div className="h-3 w-24 rounded bg-ui-border-subtle" />
        <div className="h-8 w-full rounded bg-ui-border-subtle" />
      </div>
    )
  }

  const insights = generateInsights(trends.series)

  if (insights.length === 0) {
    return (
      <div className="py-6 border-y border-ui-border-subtle flex items-center justify-center">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground italic">
          Monitoring trends...
        </p>
      </div>
    )
  }

  return (
    <div className="py-6 border-y border-ui-border-subtle space-y-5">
      <div className="flex items-center gap-2 px-1">
        <SharedIcon type="ui" name="insight" size={12} className="text-primary" />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Intelligent Observations
        </h3>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {insights.map((insight, index) => (
          <InsightItem key={index} insight={insight} />
        ))}
      </div>
    </div>
  )
}

function InsightItem({ insight }: { insight: Insight }) {
  const config = {
    trend: { icon: 'trend', color: 'text-primary' },
    anomaly: { icon: 'expense', color: 'text-error' },
    success: { icon: 'income', color: 'text-success' },
  }[insight.type]

  return (
    <div className="flex gap-4 items-start group">
      <div
        className={`p-2 rounded-full bg-ui-surface-muted group-hover:bg-ui-surface-hover transition-colors shrink-0`}
      >
        <SharedIcon
          type="ui"
          name={config.icon as 'trend' | 'expense' | 'income'}
          size={12}
          className={config.color}
        />
      </div>
      <div className="space-y-0.5">
        <p className="text-xs font-semibold uppercase tracking-wider text-foreground/40 leading-none">
          {insight.type}
        </p>
        <p className="text-xs font-semibold text-foreground/80 leading-relaxed pt-0.5">
          {insight.message}
        </p>
      </div>
    </div>
  )
}
