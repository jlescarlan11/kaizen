import { type ReactElement } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '../../../shared/components/Button'

export function TransactionDetailActions(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  return (
    <Button
      onClick={() => navigate(`/transactions/edit/${id}`)}
      variant="ghost"
      className="h-9 px-4 border border-ui-border-subtle text-xs font-semibold uppercase tracking-wide hover:bg-ui-surface-muted hover:border-ui-border-strong transition-all"
    >
      Edit
    </Button>
  )
}
