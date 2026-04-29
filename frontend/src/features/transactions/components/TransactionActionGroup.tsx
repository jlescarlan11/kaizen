import { type ReactElement } from 'react'
import { SharedIcon } from '../../../shared/components/IconRegistry'
import { cn } from '../../../shared/lib/cn'
import { Button } from '../../../shared/components/Button'

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
      <Button
        variant="secondaryLg"
        onClick={onEdit}
        disabled={isProcessing}
        className="flex items-center gap-2 group"
      >
        <SharedIcon
          type="ui"
          name="edit"
          size={12}
          className="text-muted-foreground group-hover:text-primary transition-colors"
        />
        Edit Entry
      </Button>

      <Button
        variant="secondaryLg"
        onClick={onDelete}
        disabled={isProcessing}
        className="flex items-center gap-2 group hover:text-ui-danger hover:border-ui-danger/30"
      >
        <SharedIcon
          type="ui"
          name="trash"
          size={12}
          className="text-muted-foreground group-hover:text-ui-danger transition-colors"
        />
        Delete Record
      </Button>
    </div>
  )
}
