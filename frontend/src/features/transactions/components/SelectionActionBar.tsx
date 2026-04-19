import type { ReactElement } from 'react'
import { useAppSelector, useAppDispatch } from '../../../app/store/hooks'
import {
  selectIsSelectionMode,
  selectSelectedIds,
  setSelectionMode,
  clearSelection,
} from '../transactionSlice'
import { Button } from '../../../shared/components/Button'
import { Card } from '../../../shared/components/Card'
import { Trash2, X } from 'lucide-react'

interface SelectionActionBarProps {
  onDeleteRequest: () => void
}

export function SelectionActionBar({
  onDeleteRequest,
}: SelectionActionBarProps): ReactElement | null {
  const dispatch = useAppDispatch()
  const isSelectionMode = useAppSelector(selectIsSelectionMode)
  const selectedIds = useAppSelector(selectSelectedIds)

  if (!isSelectionMode) return null

  const handleExit = () => {
    dispatch(setSelectionMode(false))
    dispatch(clearSelection())
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-lg">
      <Card className="bg-ui-surface-strong border-ui-border shadow-2xl p-4 flex items-center justify-between animate-in fade-in slide-in-from-bottom-4 duration-300 rounded-2xl">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 rounded-full hover:bg-white/10 text-white"
            onClick={handleExit}
            title="Exit selection mode"
          >
            <X size={18} />
          </Button>
          <p className="font-bold text-white tracking-tight">
            <span className="text-primary-light mr-1">{selectedIds.length}</span>
            Selected
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="bg-ui-error hover:bg-ui-error-hover text-white border-0 px-4 font-bold uppercase tracking-widest text-[11px] h-9 shadow-lg shadow-ui-error/20"
            onClick={onDeleteRequest}
            disabled={selectedIds.length === 0}
          >
            <Trash2 className="h-3.5 w-3.5 mr-2" />
            Delete
          </Button>
        </div>
      </Card>
    </div>
  )
}
