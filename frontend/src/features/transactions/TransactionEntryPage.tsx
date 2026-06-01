import type { ReactElement } from 'react'
import { useParams } from 'react-router-dom'
import { TransactionEntryForm } from './components/TransactionEntryForm'
import { pageLayout } from '../../shared/styles/layout'
import { cn } from '../../shared/lib/cn'
import { PageHeader } from '../../shared/components/PageHeader'
import { useGetTransactionQuery } from '../../app/store/api/transactionApi'
import { useSetBreadcrumbLabel } from '../../shared/components/BreadcrumbLabelContext'

export function TransactionEntryPage(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const editId = id ? parseInt(id) : undefined

  const { data: editTransaction } = useGetTransactionQuery(editId!, { skip: !editId })
  useSetBreadcrumbLabel(editId ? editTransaction?.description : undefined)

  return (
    <div className={cn(pageLayout.sectionGap, 'animate-entrance-slide-up pb-32')}>
      <div className="w-full space-y-6">
        <PageHeader title={editId ? 'Edit Transaction' : 'Add Transaction'} />

        <div className="w-full">
          <TransactionEntryForm editId={editId} noCard />
        </div>
      </div>
    </div>
  )
}
