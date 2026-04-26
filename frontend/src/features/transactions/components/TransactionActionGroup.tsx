import { type ReactElement } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '../../../shared/lib/cn'

interface TransactionActionGroupProps {
  onEdit: () => void
  onDelete: () => void
  isProcessing?: boolean
  className?: string
}

export function TransactionActionGroup({
  onEdit,
  onDelete,
  isProcessing = false,
  className,
}: TransactionActionGroupProps): ReactElement {
  return (
    <div className={cn('flex flex-wrap gap-4', className)}>
      <button
        onClick={onEdit}
        disabled={isProcessing}
        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-ui-surface border border-ui-border rounded-xl text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary hover:border-primary/30 transition-all disabled:opacity-50 shadow-sm group"
      >
        <Pencil
          size={12}
          className="text-muted-foreground group-hover:text-primary transition-colors"
        />
        Edit Entry
      </button>

      <button
        onClick={onDelete}
        disabled={isProcessing}
        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-ui-surface border border-ui-border rounded-xl text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-ui-danger hover:border-ui-danger/30 transition-all disabled:opacity-50 shadow-sm group"
      >
        <Trash2
          size={12}
          className="text-muted-foreground group-hover:text-ui-danger transition-colors"
        />
        Delete Record
      </button>
    </div>
  )
}
