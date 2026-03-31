import { type ReactElement } from 'react'
import { cn } from '../../../shared/lib/cn'

interface TransactionNoteSectionProps {
  description: string | null
  notes: string | null
  className?: string
}

export function TransactionNoteSection({
  description,
  notes,
  className,
}: TransactionNoteSectionProps): ReactElement | null {
  if (!description && !notes) return null

  return (
    <div className={cn('space-y-8', className)}>
      {description && (
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Description
          </p>
          <p className="text-lg font-medium text-foreground leading-relaxed whitespace-pre-wrap">
            {description}
          </p>
        </div>
      )}

      {notes && (
        <div className="space-y-3 p-5 bg-ui-surface-muted/50 border border-ui-border-subtle rounded-2xl">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Internal Notes
          </p>
          <p className="text-base text-foreground/80 leading-relaxed whitespace-pre-wrap italic">
            "{notes}"
          </p>
        </div>
      )}
    </div>
  )
}
