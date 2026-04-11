import { describe, it, expect } from 'vitest'
import balanceSummaryReducer, {
  setDateRange,
  setSelectedAccountIds,
  setGranularity,
  setPeriodPreset,
} from './balanceSummarySlice'
import type { BalanceSummaryState } from './types'
import { getPeriodRange } from './constants'

describe('balanceSummarySlice', () => {
  const initialState: BalanceSummaryState = {
    dateRange: getPeriodRange('CURRENT_MONTH'),
    selectedAccountIds: [],
    granularity: 'MONTHLY',
    periodPreset: 'CURRENT_MONTH',
  }

  it('should handle setDateRange', () => {
    const range = { start: '2026-01-01', end: '2026-01-31' }
    const actual = balanceSummaryReducer(initialState, setDateRange(range))
    expect(actual.dateRange).toEqual(range)
  })

  it('should handle setSelectedAccountIds', () => {
    const ids = [1, 2, 3]
    const actual = balanceSummaryReducer(initialState, setSelectedAccountIds(ids))
    expect(actual.selectedAccountIds).toEqual(ids)
  })

  it('should handle setGranularity', () => {
    const actual = balanceSummaryReducer(initialState, setGranularity('DAILY'))
    expect(actual.granularity).toEqual('DAILY')
  })

  it('should handle setPeriodPreset', () => {
    const actual = balanceSummaryReducer(initialState, setPeriodPreset('YTD'))
    expect(actual.periodPreset).toEqual('YTD')
  })
})
