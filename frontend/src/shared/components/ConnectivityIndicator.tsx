import { useState, useEffect } from 'react'
import { SharedIcon } from './IconRegistry'
import { cn } from '../../shared/lib/cn'

export function ConnectivityIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showIndicator, setShowIndicator] = useState(!navigator.onLine)

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Show "Back Online" briefly
      setShowIndicator(true)
      const timer = setTimeout(() => setShowIndicator(false), 3000)
      return () => clearTimeout(timer)
    }
    const handleOffline = () => {
      setIsOnline(false)
      setShowIndicator(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showIndicator && isOnline) return null

  return (
    <div
      className={cn(
        'fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-semibold transition-all animate-in fade-in slide-in-from-top-2',
        isOnline ? 'bg-ui-success text-white' : 'bg-ui-danger text-white',
      )}
    >
      {isOnline ? (
        <>
          <SharedIcon type="ui" name="wifi" size={16} />
          <span>Back Online. Syncing...</span>
        </>
      ) : (
        <>
          <SharedIcon type="ui" name="wifi-off" size={16} />
          <span>Offline Mode. Transactions will be saved locally.</span>
        </>
      )}
    </div>
  )
}
