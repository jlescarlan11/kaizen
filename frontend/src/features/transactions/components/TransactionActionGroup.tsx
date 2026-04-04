import { type ReactElement } from 'react'
import { Button } from '../../../shared/components/Button'
import { Trash2 } from 'lucide-react'
import { cn } from '../../../shared/lib/cn'

interface TransactionActionGroupProps {
  onDelete: () => void
  isProcessing?: boolean
  className?: string
}

export function TransactionActionGroup({
  onDelete,
  isProcessing = false,
  className,
}: TransactionActionGroupProps): ReactElement {
  return (
    <div className={cn('grid grid-cols-1', className)}>
      <Button
        variant="ghost"
        onClick={onDelete}
        disabled={isProcessing}
        className="h-14 flex items-center justify-center gap-3 border border-ui-border-subtle hover:bg-ui-danger/5 hover:border-ui-danger/30 hover:text-ui-danger transition-all rounded-2xl group"
      >
        <Trash2 className="h-5 w-5 text-muted-foreground group-hover:text-ui-danger transition-colors" />
        <span className="text-sm font-bold uppercase tracking-widest text-muted-foreground group-hover:text-ui-danger transition-colors">
          Delete
        </span>
      </Button>
    </div>
  )
}
