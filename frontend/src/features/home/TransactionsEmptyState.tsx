import type { ReactElement, Ref } from 'react'
import { Button } from '../../shared/components/Button'
import { Card } from '../../shared/components/Card'
import {
  TRANSACTIONS_EMPTY_BUTTON,
  TRANSACTIONS_EMPTY_SUBTEXT,
  TRANSACTIONS_EMPTY_TITLE,
} from './emptyStateCopy'

interface TransactionsEmptyStateProps {
  onAddTransaction: () => void
  buttonRef?: Ref<HTMLButtonElement>
}

export function TransactionsEmptyState({
  onAddTransaction,
  buttonRef,
}: TransactionsEmptyStateProps): ReactElement {
  return (
    <Card className="space-y-3 border border-ui-border-subtle p-6">
      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">{TRANSACTIONS_EMPTY_TITLE}</p>
        <p className="text-sm text-muted-foreground">{TRANSACTIONS_EMPTY_SUBTEXT}</p>
      </div>
      <Button
        type="button"
        variant="primary"
        onClick={onAddTransaction}
        ref={buttonRef}
        className="text-sm font-medium"
      >
        {TRANSACTIONS_EMPTY_BUTTON}
      </Button>
    </Card>
  )
}
