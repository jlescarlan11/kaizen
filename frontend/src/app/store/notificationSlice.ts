import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'
import { transactionApi } from './api/transactionApi'

export interface UndoableAction {
  id: string
  message: string
  transactionIds: number[]
  timeoutMs: number
}

export interface AlertNotification {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'info'
  dataSaved?: boolean
  autoRetry?: boolean
}

interface NotificationState {
  pendingDeletes: number[]
  activeUndo: UndoableAction | null
  activeAlert: AlertNotification | null
}

const initialState: NotificationState = {
  pendingDeletes: [],
  activeUndo: null,
  activeAlert: null,
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
    setAlert: (state, action: PayloadAction<AlertNotification | null>) => {
      state.activeAlert = action.payload
    },
  },
})

export const { setPendingDeletes, clearPendingDeletes, setActiveUndo, setAlert } =
  notificationSlice.actions

// Thunk to show an alert that auto-dismisses
export const showAlert = createAsyncThunk(
  'notification/showAlert',
  async (alert: Omit<AlertNotification, 'id'>, { dispatch }) => {
    const id = Math.random().toString(36).substring(7)
    dispatch(setAlert({ ...alert, id }))

    // Auto dismiss after 5 seconds if not error, or 8 seconds if error
    const timeout = alert.type === 'error' ? 8000 : 5000
    await new Promise((resolve) => setTimeout(resolve, timeout))

    dispatch(setAlert(null))
  },
)

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
export const selectActiveAlert = (state: RootState) => state.notification.activeAlert

export default notificationSlice.reducer
