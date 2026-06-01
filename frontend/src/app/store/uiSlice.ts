import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from './store'

interface UIState {
  isPrivacyMode: boolean
}

const initialState: UIState = {
  // Load from local storage if available to persist between refreshes
  isPrivacyMode: localStorage.getItem('kaizen_privacy_mode') === 'true',
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    togglePrivacyMode: (state) => {
      state.isPrivacyMode = !state.isPrivacyMode
      localStorage.setItem('kaizen_privacy_mode', String(state.isPrivacyMode))
    },
    setPrivacyMode: (state, action: PayloadAction<boolean>) => {
      state.isPrivacyMode = action.payload
      localStorage.setItem('kaizen_privacy_mode', String(action.payload))
    },
  },
})

export const { togglePrivacyMode, setPrivacyMode } = uiSlice.actions

export const selectIsPrivacyMode = (state: RootState) => state.ui.isPrivacyMode

export default uiSlice.reducer
