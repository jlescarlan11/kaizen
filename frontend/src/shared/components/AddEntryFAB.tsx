import { type ReactElement } from 'react'
import { Plus } from 'lucide-react'
import { cn } from '../lib/cn'

interface AddEntryFABProps {
  onClick: () => void
  className?: string
}

/**
 * AddEntryFAB: A persistent Floating Action Button for adding entries.
 * Located at the bottom right of the screen.
 */
export function AddEntryFAB({ onClick, className }: AddEntryFABProps): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Add entry"
      className={cn(
        'fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-ui-action-bg text-ui-action-text shadow-lg hover:bg-ui-action-bg-hover active:bg-ui-action-bg-active transition-all md:bottom-10 md:right-10',
        className,
      )}
    >
      <Plus className="h-6 w-6" strokeWidth={3} />
    </button>
  )
}
