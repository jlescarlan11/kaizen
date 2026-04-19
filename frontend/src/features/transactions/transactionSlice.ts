import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store/store'

interface TransactionState {
  isSelectionMode: boolean
  selectedIds: number[]
}

const initialState: TransactionState = {
  isSelectionMode: false,
  selectedIds: [],
}

export const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setSelectionMode: (state, action: PayloadAction<boolean>) => {
      state.isSelectionMode = action.payload
      if (!action.payload) {
        state.selectedIds = []
      }
    },
    toggleSelection: (state, action: PayloadAction<number>) => {
      const id = action.payload
      const index = state.selectedIds.indexOf(id)
      if (index === -1) {
        state.selectedIds.push(id)
      } else {
        state.selectedIds.splice(index, 1)
      }
    },
    setSelectedIds: (state, action: PayloadAction<number[]>) => {
      state.selectedIds = action.payload
    },
    clearSelection: (state) => {
      state.selectedIds = []
    },
  },
})

export const { setSelectionMode, toggleSelection, setSelectedIds, clearSelection } =
  transactionSlice.actions

export const selectIsSelectionMode = (state: RootState) => state.transactions.isSelectionMode
export const selectSelectedIds = (state: RootState) => state.transactions.selectedIds

export default transactionSlice.reducer
