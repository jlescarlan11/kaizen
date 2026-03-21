import { useCallback, useContext } from 'react'
import {
  DashboardTourAnchorsContext,
  type DashboardTourAnchorKey,
  type DashboardTourAnchorsState,
} from './DashboardTourAnchorsContext'

function useDashboardTourAnchorsContextValue() {
  const context = useContext(DashboardTourAnchorsContext)
  if (!context) {
    throw new Error('DashboardTourAnchorsContext must be used within its provider')
  }
  return context
}

export function useDashboardTourAnchors(): DashboardTourAnchorsState {
  return useDashboardTourAnchorsContextValue().anchors
}

export function useRegisterDashboardTourAnchor(
  key: DashboardTourAnchorKey,
): (node: HTMLElement | null) => void {
  const { registerAnchor } = useDashboardTourAnchorsContextValue()
  return useCallback((node: HTMLElement | null) => registerAnchor(key, node), [key, registerAnchor])
}
