import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { BalanceSummaryState, DateRange, Granularity, PeriodOption } from './types'
import { getPeriodRange } from './constants'

const initialState: BalanceSummaryState = {
  dateRange: getPeriodRange('CURRENT_MONTH'),
  selectedAccountIds: [],
  granularity: 'MONTHLY',
  periodPreset: 'CURRENT_MONTH',
}

const balanceSummarySlice = createSlice({
  name: 'balanceSummary',
  initialState,
  reducers: {
    setDateRange: (state, action: PayloadAction<DateRange>) => {
      state.dateRange = action.payload
    },
    setSelectedAccountIds: (state, action: PayloadAction<number[]>) => {
      state.selectedAccountIds = action.payload
    },
    setGranularity: (state, action: PayloadAction<Granularity>) => {
      state.granularity = action.payload
    },
    setPeriodPreset: (state, action: PayloadAction<PeriodOption>) => {
      state.periodPreset = action.payload
    },
  },
})

export const { setDateRange, setSelectedAccountIds, setGranularity, setPeriodPreset } =
  balanceSummarySlice.actions

export default balanceSummarySlice.reducer
