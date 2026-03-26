import type { ReactElement } from 'react'
import { TransactionEntryForm } from './components/TransactionEntryForm'
import { pageLayout } from '../../shared/styles/layout'

export function TransactionEntryPage(): ReactElement {
  return (
    <div className={pageLayout.sectionGap}>
      <header className={pageLayout.headerGap}>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Add Transaction</h1>
        <p className="text-muted-foreground">
          Record a new expense or income to keep your balance up to date.
        </p>
      </header>

      <div className="mx-auto max-w-2xl w-full">
        <TransactionEntryForm />
      </div>
    </div>
  )
}
