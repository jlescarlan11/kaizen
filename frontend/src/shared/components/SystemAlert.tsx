import type { ReactElement } from 'react'
import { Card } from './Card'
import { useAppDispatch, useAppSelector } from '../../app/store/hooks'
import { selectActiveAlert, setAlert } from '../../app/store/notificationSlice'
import { cn } from '../lib/cn'
import { X, CheckCircle, AlertCircle, Info, RefreshCw } from 'lucide-react'

export function SystemAlert(): ReactElement | null {
  const dispatch = useAppDispatch()
  const activeAlert = useAppSelector(selectActiveAlert)

  if (!activeAlert) return null

  const typeStyles = {
    success: 'bg-success/10 border-success/20 text-success',
    error: 'bg-error/10 border-error/20 text-error',
    info: 'bg-primary/10 border-primary/20 text-primary',
  }

  const icons = {
    success: <CheckCircle className="h-5 w-5" />,
    error: <AlertCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />,
  }

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-md animate-in fade-in slide-in-from-top-4 duration-300">
      <Card
        className={cn(
          'border-2 shadow-xl p-4 flex gap-4 overflow-hidden rounded-2xl',
          typeStyles[activeAlert.type],
        )}
      >
        <div className="mt-0.5">{icons[activeAlert.type]}</div>

        <div className="flex-1 flex flex-col gap-1">
          <h4 className="font-semibold leading-tight">{activeAlert.title}</h4>
          <p className="text-sm opacity-90">{activeAlert.message}</p>

          {(activeAlert.dataSaved !== undefined || activeAlert.autoRetry !== undefined) && (
            <div className="mt-2 pt-2 border-t border-current/10 flex flex-wrap gap-x-4 gap-y-1 text-xs font-medium">
              {activeAlert.dataSaved !== undefined && (
                <span>Data Saved: {activeAlert.dataSaved ? 'Yes' : 'No'}</span>
              )}
              {activeAlert.autoRetry !== undefined && (
                <span className="flex items-center gap-1">
                  {activeAlert.autoRetry ? (
                    <>
                      <RefreshCw className="h-3 w-3 animate-spin-slow" />
                      Automatic Retry Pending
                    </>
                  ) : (
                    'Manual Action Required'
                  )}
                </span>
              )}
            </div>
          )}
        </div>

        <button
          onClick={() => dispatch(setAlert(null))}
          className="h-fit p-1 hover:bg-current/10 rounded-full transition-colors"
          aria-label="Close alert"
        >
          <X className="h-4 w-4" />
        </button>
      </Card>
    </div>
  )
}
