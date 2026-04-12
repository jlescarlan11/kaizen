import { describe, it, expect } from 'vitest'
import { generateInsights } from './insightGenerator'
import type { BalanceTrendEntry } from '../types'

describe('insightGenerator', () => {
  const mockSeries: BalanceTrendEntry[] = [
    { periodStart: '2026-01-01', income: 1000, expenses: 500, netBalance: 500 },
    { periodStart: '2026-02-01', income: 1200, expenses: 600, netBalance: 600 },
    { periodStart: '2026-03-01', income: 1500, expenses: 2000, netBalance: -500 },
  ]

  it('detects negative net balance anomaly', () => {
    const insights = generateInsights(mockSeries)
    const anomaly = insights.find((i) => i.type === 'anomaly')
    expect(anomaly).toBeDefined()
    expect(anomaly?.message).toContain('Negative net flow')
  })

  it('detects income increase trend', () => {
    const insights = generateInsights(mockSeries)
    const trend = insights.find((i) => i.message.includes('Income increased'))
    expect(trend).toBeDefined()
  })

  it('returns empty array for insufficient data', () => {
    const insights = generateInsights([])
    expect(insights).toEqual([])
  })
})
