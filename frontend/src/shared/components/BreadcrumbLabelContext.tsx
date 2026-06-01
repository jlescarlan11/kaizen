import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactElement,
  type ReactNode,
} from 'react'
import { useLocation } from 'react-router-dom'

interface LabelEntry {
  label: string
  pathname: string
}

interface BreadcrumbLabelContextValue {
  entry: LabelEntry
  setLabel: (label: string, pathname: string) => void
}

const BreadcrumbLabelContext = createContext<BreadcrumbLabelContextValue>({
  entry: { label: '', pathname: '' },
  setLabel: () => {},
})

export function BreadcrumbLabelProvider({ children }: { children: ReactNode }): ReactElement {
  const [entry, setEntry] = useState<LabelEntry>({ label: '', pathname: '' })

  const setLabel = useCallback((label: string, pathname: string) => {
    setEntry({ label, pathname })
  }, [])

  return (
    <BreadcrumbLabelContext.Provider value={{ entry, setLabel }}>
      {children}
    </BreadcrumbLabelContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useSetBreadcrumbLabel(label: string | undefined | null): void {
  const { setLabel } = useContext(BreadcrumbLabelContext)
  const { pathname } = useLocation()
  useEffect(() => {
    if (label) setLabel(label, pathname)
  }, [label, pathname, setLabel])
}

// eslint-disable-next-line react-refresh/only-export-components
export function useBreadcrumbLabel(): string {
  const { entry } = useContext(BreadcrumbLabelContext)
  const { pathname } = useLocation()
  // Only return the label if it was registered for the current pathname
  return entry.pathname === pathname ? entry.label : ''
}
