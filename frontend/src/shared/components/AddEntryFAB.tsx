import { type ReactElement, useState } from 'react'
import { SharedIcon } from './IconRegistry'
import { cn } from '../lib/cn'
import { useMediaQuery } from '../hooks/useMediaQuery'

interface AddEntryFABProps {
  onAddTransaction: () => void
  onCreateBudget: () => void
  onCreateGoal: () => void
  onHoldPurchase: () => void
  className?: string
}

/**
 * AddEntryFAB: A Speed Dial Floating Action Button for quick actions.
 * Located at the bottom right of the screen.
 */
export function AddEntryFAB({
  onAddTransaction,
  onCreateBudget,
  onCreateGoal,
  onHoldPurchase,
  className,
}: AddEntryFABProps): ReactElement {
  const [isOpen, setIsOpen] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)')

  const toggle = () => setIsOpen(!isOpen)

  const actions = [
    {
      icon: <SharedIcon type="ui" name="receipt" size={20} />,
      label: 'Add Transaction',
      onClick: () => {
        onAddTransaction()
        setIsOpen(false)
      },
      color: 'bg-ui-action text-ui-action-text',
    },
    {
      icon: <SharedIcon type="ui" name="wallet" size={20} />,
      label: 'Create Budget',
      onClick: () => {
        onCreateBudget()
        setIsOpen(false)
      },
      color: 'bg-ui-accent text-foreground',
    },
    {
      icon: <SharedIcon type="ui" name="target" size={20} />,
      label: 'Create Goal',
      onClick: () => {
        onCreateGoal()
        setIsOpen(false)
      },
      color: 'bg-ui-success text-ui-success-text',
    },
    {
      icon: <SharedIcon type="ui" name="hand" size={20} />,
      label: 'Hold Purchase',
      onClick: () => {
        onHoldPurchase()
        setIsOpen(false)
      },
      color: 'bg-ui-warning text-ui-warning-text',
    },
  ]

  return (
    <div
      className={cn(
        'fixed bottom-24 right-6 z-40 flex flex-col items-end gap-3 md:bottom-10 md:right-10 pointer-events-none',
        className,
      )}
    >
      {/* Action Buttons (Speed Dial Items) */}
      <div
        className={cn(
          'flex flex-col items-end gap-3 transition-all duration-300 origin-bottom',
          isOpen
            ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
            : 'opacity-0 translate-y-10 scale-50 pointer-events-none invisible',
        )}
      >
        {actions.map((action, index) => (
          <div key={index} className="flex items-center gap-3 group">
            <span
              className={cn(
                'px-2.5 py-1 rounded-lg bg-ui-surface border border-ui-border-subtle text-foreground text-xs font-semibold uppercase tracking-wider shadow-sm transition-all duration-200 whitespace-nowrap pointer-events-auto',
                isMobile
                  ? isOpen
                    ? 'opacity-100 translate-x-0 scale-100'
                    : 'opacity-0 translate-x-4 scale-90'
                  : 'opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0',
              )}
              style={isMobile ? { transitionDelay: `${index * 50}ms` } : undefined}
            >
              {action.label}
            </span>
            <button
              type="button"
              onClick={action.onClick}
              aria-label={action.label}
              className={cn(
                'flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all hover:scale-110 active:scale-95 shrink-0 pointer-events-auto',
                action.color,
              )}
            >
              {action.icon}
            </button>
          </div>
        ))}
      </div>

      {/* Main Toggle Button */}
      <button
        type="button"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Close quick actions' : 'Open quick actions'}
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-full border-2 border-ui-border-strong bg-ui-surface text-foreground shadow-2xl transition-all hover:bg-ui-surface-muted active:scale-95 pointer-events-auto',
          isOpen && 'rotate-45 bg-ui-surface-muted',
        )}
      >
        {isOpen ? (
          <SharedIcon type="ui" name="close" size={20} />
        ) : (
          <SharedIcon type="ui" name="plus" size={20} />
        )}
      </button>
    </div>
  )
}
