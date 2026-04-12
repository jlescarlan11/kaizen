import type { ReactElement } from 'react'
import { useEffect, useState } from 'react'
import { Button } from './Button'
import { Card } from './Card'
import { useAppDispatch, useAppSelector } from '../../app/store/hooks'
import { selectActiveUndo, undoDeletion } from '../../app/store/notificationSlice'
import { cn } from '../lib/cn'

interface UndoSnackbarProps {
  offset?: 'standard' | 'mobile-nav'
}

export function UndoSnackbar({ offset = 'standard' }: UndoSnackbarProps): ReactElement | null {
  const dispatch = useAppDispatch()
  const activeUndo = useAppSelector(selectActiveUndo)
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (activeUndo) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProgress(100)
      const interval = 100 // update every 100ms
      const step = (interval / activeUndo.timeoutMs) * 100

      const timer = setInterval(() => {
        setProgress((prev) => Math.max(0, prev - step))
      }, interval)

      return () => clearInterval(timer)
    }
  }, [activeUndo])

  if (!activeUndo) return null

  return (
    <div
      className={cn(
        'fixed left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm transition-all duration-300',
        offset === 'mobile-nav' ? 'bottom-28' : 'bottom-6',
      )}
    >
      <Card className="bg-ui-surface-strong border-ui-border shadow-2xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-300 rounded-2xl overflow-hidden">
        <div className="flex flex-col flex-1 gap-1">
          <p className="font-semibold text-white">{activeUndo.message}</p>
          <div className="h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-100 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:bg-white/10 font-bold px-4 ml-4"
          onClick={() => dispatch(undoDeletion())}
        >
          UNDO
        </Button>
      </Card>
    </div>
  )
}
