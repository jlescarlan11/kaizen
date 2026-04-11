import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { BalanceSummaryState, Granularity } from './types'

const initialState: BalanceSummaryState = {
  selectedAccountIds: [],
  granularity: 'MONTHLY',
}

const balanceSummarySlice = createSlice({
  name: 'balanceSummary',
  initialState,
  reducers: {
    setSelectedAccountIds: (state, action: PayloadAction<number[]>) => {
      state.selectedAccountIds = action.payload
    },
    setGranularity: (state, action: PayloadAction<Granularity>) => {
      state.granularity = action.payload
    },
  },
})

export const { setSelectedAccountIds, setGranularity } = balanceSummarySlice.actions

export default balanceSummarySlice.reducer
