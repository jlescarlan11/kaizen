import type { ReactElement } from 'react'
import { useParams } from 'react-router-dom'
import { TransactionEntryForm } from './components/TransactionEntryForm'
import { pageLayout } from '../../shared/styles/layout'

export function TransactionEntryPage(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const editId = id ? parseInt(id) : undefined

  return (
    <div className={pageLayout.sectionGap}>
      <header className={pageLayout.headerGap}>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          {editId ? 'Edit Transaction' : 'Add Transaction'}
        </h1>
        <p className="text-muted-foreground">
          {editId
            ? 'Update the details of your recorded transaction.'
            : 'Record a new expense or income to keep your balance up to date.'}
        </p>
      </header>

      <div className="mx-auto max-w-2xl w-full">
        <TransactionEntryForm editId={editId} />
      </div>
    </div>
  )
}
