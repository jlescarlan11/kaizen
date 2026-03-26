import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'
import { transactionApi } from './api/transactionApi'

export interface UndoableAction {
  id: string
  message: string
  transactionIds: number[]
  timeoutMs: number
}

interface NotificationState {
  pendingDeletes: number[]
  activeUndo: UndoableAction | null
}

const initialState: NotificationState = {
  pendingDeletes: [],
  activeUndo: null,
}

export const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    setPendingDeletes: (state, action: PayloadAction<number[]>) => {
      state.pendingDeletes = [...state.pendingDeletes, ...action.payload]
    },
    clearPendingDeletes: (state, action: PayloadAction<number[]>) => {
      state.pendingDeletes = state.pendingDeletes.filter((id) => !action.payload.includes(id))
    },
    setActiveUndo: (state, action: PayloadAction<UndoableAction | null>) => {
      state.activeUndo = action.payload
    },
  },
})

export const { setPendingDeletes, clearPendingDeletes, setActiveUndo } = notificationSlice.actions

// Thunk to handle the delayed delete with undo
export const triggerDeleteWithUndo = createAsyncThunk(
  'notification/triggerDeleteWithUndo',
  async (
    { message, transactionIds, timeoutMs = 5000 }: Omit<UndoableAction, 'id'>,
    { dispatch, getState },
  ) => {
    const id = Math.random().toString(36).substring(7)

    // 1. Mark as pending delete in UI
    dispatch(setPendingDeletes(transactionIds))

    // 2. Set as active undo notification
    dispatch(setActiveUndo({ id, message, transactionIds, timeoutMs }))

    // 3. Wait for timeout
    await new Promise((resolve) => setTimeout(resolve, timeoutMs))

    // 4. Check if it's still the active undo (not undone by user)
    const state = getState() as RootState
    if (state.notification.activeUndo?.id === id) {
      // 5. Finalize deletion on backend
      try {
        if (transactionIds.length === 1) {
          await dispatch(
            transactionApi.endpoints.deleteTransaction.initiate(transactionIds[0]),
          ).unwrap()
        } else if (transactionIds.length > 1) {
          await dispatch(
            transactionApi.endpoints.bulkDeleteTransactions.initiate(transactionIds),
          ).unwrap()
        }
      } catch (err) {
        console.error('Failed to finalize deletion:', err)
      } finally {
        // 6. Cleanup
        dispatch(clearPendingDeletes(transactionIds))
        dispatch(setActiveUndo(null))
      }
    }
  },
)

// Thunk to undo
export const undoDeletion = createAsyncThunk(
  'notification/undoDeletion',
  async (_, { dispatch, getState }) => {
    const state = getState() as RootState
    const activeUndo = state.notification.activeUndo

    if (activeUndo) {
      dispatch(clearPendingDeletes(activeUndo.transactionIds))
      dispatch(setActiveUndo(null))
    }
  },
)

export const selectPendingDeletes = (state: RootState) => state.notification.pendingDeletes
export const selectActiveUndo = (state: RootState) => state.notification.activeUndo

export default notificationSlice.reducer
