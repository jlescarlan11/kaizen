import { useState, useMemo, type ReactElement } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useGetTransactionQuery,
  useDeleteTransactionMutation,
  useGetTransactionsQuery,
} from '../../app/store/api/transactionApi'
import { Button } from '../../shared/components/Button'
import { Modal } from '../../shared/components/Modal'
import { pageLayout } from '../../shared/styles/layout'
import { cn } from '../../shared/lib/cn'
import { TransactionDetailHeader } from './components/TransactionDetailHeader'
import { TransactionDetailInfo } from './components/TransactionDetailInfo'
import { TransactionActionGroup } from './components/TransactionActionGroup'
import { TransactionNoteSection } from './components/TransactionNoteSection'
import { AttachmentViewer } from './components/AttachmentViewer'
import { RelatedTransactionsList } from './components/RelatedTransactionsList'

export function TransactionDetailPage(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const transactionId = Number(id)

  const { data: transaction, isLoading, error } = useGetTransactionQuery(transactionId)
  const { data: allTransactions, isLoading: isLoadingAll } = useGetTransactionsQuery({
    pageSize: 50,
  })

  const [deleteTransaction, { isLoading: isDeleting }] = useDeleteTransactionMutation()

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  // Filter related transactions (same category, excluding current one)
  const relatedTransactions = useMemo(() => {
    if (!transaction || !allTransactions) return []
    return allTransactions
      .filter((t) => t.id !== transaction.id && t.category?.id === transaction.category?.id)
      .slice(0, 3) // Only show top 3
  }, [transaction, allTransactions])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <h2 className="text-xl font-semibold text-foreground">Transaction not found</h2>
        <Button variant="ghost" onClick={() => navigate('/transactions')} className="mt-4">
          Back to Transactions
        </Button>
      </div>
    )
  }

  const handleDelete = async () => {
    try {
      await deleteTransaction(transaction.id).unwrap()
      navigate('/transactions', { replace: true })
    } catch (err) {
      console.error('Failed to delete transaction:', err)
    }
  }

  return (
    <div className={cn(pageLayout.sectionGap, 'pt-4 md:pt-8')}>
      <div className="mx-auto max-w-3xl w-full space-y-12 pb-24">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-foreground">
            Transaction Details
          </h1>
          <p className="text-muted-foreground text-lg">Full overview of your record.</p>
        </div>

        <TransactionDetailHeader
          amount={transaction.amount}
          type={transaction.type}
          date={transaction.transactionDate}
        />

        <TransactionActionGroup
          onEdit={() => navigate(`/transactions/edit/${transaction.id}`)}
          onDelete={() => setIsDeleteModalOpen(true)}
          isProcessing={isDeleting}
        />

        <div className="space-y-12">
          <section>
            <TransactionDetailInfo
              category={transaction.category}
              paymentMethod={transaction.paymentMethod}
              type={transaction.type}
            />
          </section>

          {(transaction.description || transaction.notes) && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <TransactionNoteSection
                description={transaction.description}
                notes={transaction.notes}
              />
            </section>
          )}

          {transaction.attachments && transaction.attachments.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-600">
              <AttachmentViewer attachments={transaction.attachments} />
            </section>
          )}

          <section className="pt-4 border-t border-ui-border-subtle animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
                History & Related
              </h3>
              <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full uppercase tracking-wider">
                Same Category
              </span>
            </div>
            <RelatedTransactionsList transactions={relatedTransactions} isLoading={isLoadingAll} />
          </section>
        </div>
      </div>

      <Modal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Transaction"
        footer={
          <div className="flex gap-3 mt-6">
            <Button
              variant="ghost"
              className="flex-1 border border-ui-border-subtle"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1 bg-ui-danger hover:bg-ui-danger/90 border-none"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-muted-foreground">
          Are you sure you want to delete this transaction? This action cannot be undone.
        </p>
      </Modal>
    </div>
  )
}
