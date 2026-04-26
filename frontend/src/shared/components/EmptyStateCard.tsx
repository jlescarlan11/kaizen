import type { ReactElement, ReactNode } from 'react'
import { Button } from './Button'

export interface EmptyStateCardProps {
  icon?: ReactNode
  title: string
  description?: string
  primaryAction?: { label: string; onClick: () => void }
  secondaryAction?: { label: string; onClick: () => void }
  className?: string
}

/**
 * EmptyStateCard — canonical empty-state primitive.
 *
 * Canonical rule (U-FRM-4):
 *   Use this component for every surface that has no data to display.
 *   It renders a dashed-border card with an optional icon, a required
 *   title, an optional description, and up to two action buttons.
 *
 *   Feature-specific empty states (e.g. TransactionEmptyState, which
 *   drives conditional copy based on active search/filter state) should
 *   continue to exist as thin feature wrappers; their JSX should either
 *   delegate to this component or remain self-contained when the logic
 *   is non-trivial.
 */
export function EmptyStateCard({
  icon,
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
}: EmptyStateCardProps): ReactElement {
  return (
    <div
      className={[
        'p-12 text-center border border-dashed border-ui-border-subtle rounded-2xl flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-300',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {icon && (
        <div className="h-12 w-12 bg-ui-accent-subtle flex items-center justify-center rounded-full text-ui-action">
          {icon}
        </div>
      )}

      <div className="space-y-2 max-w-sm">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
        )}
      </div>

      {(primaryAction || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {primaryAction && <Button onClick={primaryAction.onClick}>{primaryAction.label}</Button>}
          {secondaryAction && (
            <Button variant="ghost" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
