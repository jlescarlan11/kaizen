import type { ReactElement } from 'react'
import { useParams } from 'react-router-dom'
import { TransactionEntryForm } from './components/TransactionEntryForm'
import { pageLayout } from '../../shared/styles/layout'
import { cn } from '../../shared/lib/cn'

export function TransactionEntryPage(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const editId = id ? parseInt(id) : undefined

  return (
    <div className={cn(pageLayout.sectionGap, 'animate-entrance-slide-up pb-32')}>
      <header className="mb-10">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-text-primary uppercase">
            {editId ? 'Edit Entry' : 'Add Entry'}
          </h1>
          <p className="text-lg font-medium text-text-secondary tracking-tight">
            {editId
              ? 'Update the details of your transaction.'
              : 'Record a new spend or income to stay on track.'}
          </p>
        </div>
      </header>

      <div className="max-w-4xl w-full">
        <TransactionEntryForm editId={editId} noCard />
      </div>
    </div>
  )
}
