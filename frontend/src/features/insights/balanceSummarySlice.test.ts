import { describe, it, expect } from 'vitest'
import balanceSummaryReducer, { setSelectedAccountIds, setGranularity } from './balanceSummarySlice'
import type { BalanceSummaryState } from './types'

describe('balanceSummarySlice', () => {
  const initialState: BalanceSummaryState = {
    selectedAccountIds: [],
    granularity: 'MONTHLY',
  }

  it('should handle setSelectedAccountIds', () => {
    const ids = [1, 2, 3]
    const actual = balanceSummaryReducer(initialState, setSelectedAccountIds(ids))
    expect(actual.selectedAccountIds).toEqual(ids)
  })

  it('should handle setGranularity', () => {
    const actual = balanceSummaryReducer(initialState, setGranularity('DAILY'))
    expect(actual.granularity).toEqual('DAILY')
  })
})
