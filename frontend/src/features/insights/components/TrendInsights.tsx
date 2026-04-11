import type { ReactElement } from 'react'
import { Card } from '../../../shared/components/Card'
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
      <Card className="space-y-4">
        <div className="h-6 w-32 rounded bg-black/5 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 w-full rounded bg-black/5 animate-pulse" />
          <div className="h-4 w-2/3 rounded bg-black/5 animate-pulse" />
        </div>
      </Card>
    )
  }

  const insights = generateInsights(trends.series)

  if (insights.length === 0) {
    return (
      <Card className="flex items-center justify-center py-8">
        <p className="text-xs text-muted-foreground italic">No significant trends detected yet.</p>
      </Card>
    )
  }

  return (
    <Card className="space-y-4 border-ui-border-subtle bg-ui-surface/30">
      <div className="flex items-center gap-2">
        <SharedIcon type="ui" name="insight" size={16} className="text-primary" />
        <h3 className="text-sm font-black uppercase tracking-widest text-foreground">
          Key Observations
        </h3>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <InsightItem key={index} insight={insight} />
        ))}
      </div>
    </Card>
  )
}

function InsightItem({ insight }: { insight: Insight }) {
  const config = {
    trend: { icon: 'trend', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    anomaly: { icon: 'expense', color: 'text-error', bg: 'bg-error/10' },
    success: { icon: 'income', color: 'text-success', bg: 'bg-success/10' },
  }[insight.type]

  return (
    <div className="flex gap-3 items-start animate-in slide-in-from-left-2 duration-300">
      <div className={`p-1.5 rounded-lg ${config.bg} shrink-0`}>
        <SharedIcon
          type="ui"
          name={config.icon as 'trend' | 'expense' | 'income'}
          size={12}
          className={config.color}
        />
      </div>
      <p className="text-xs font-medium text-foreground/80 leading-relaxed pt-0.5">
        {insight.message}
      </p>
    </div>
  )
}
