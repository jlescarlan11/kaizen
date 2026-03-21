/* eslint-disable react-refresh/only-export-components */

import { createContext, type ReactNode, useCallback, useMemo, useState } from 'react'

export type DashboardTourAnchorKey =
  | 'balanceCard'
  | 'addTransactionButton'
  | 'budgetsTab'
  | 'goalsTab'

export type DashboardTourAnchorsState = Record<DashboardTourAnchorKey, HTMLElement | null>

const initialAnchorState: DashboardTourAnchorsState = {
  balanceCard: null,
  addTransactionButton: null,
  budgetsTab: null,
  goalsTab: null,
}

export interface DashboardTourAnchorsContextValue {
  anchors: DashboardTourAnchorsState
  registerAnchor: (key: DashboardTourAnchorKey, node: HTMLElement | null) => void
}

export const DashboardTourAnchorsContext = createContext<DashboardTourAnchorsContextValue | null>(
  null,
)

export function DashboardTourAnchorsProvider({ children }: { children: ReactNode }) {
  const [anchors, setAnchors] = useState<DashboardTourAnchorsState>(initialAnchorState)

  const registerAnchor = useCallback((key: DashboardTourAnchorKey, node: HTMLElement | null) => {
    setAnchors((prev) => {
      if (prev[key] === node) {
        return prev
      }
      return {
        ...prev,
        [key]: node,
      }
    })
  }, [])

  const value = useMemo(() => ({ anchors, registerAnchor }), [anchors, registerAnchor])

  return (
    <DashboardTourAnchorsContext.Provider value={value}>
      {children}
    </DashboardTourAnchorsContext.Provider>
  )
}
