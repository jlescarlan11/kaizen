import { useState, useMemo, type ReactElement } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useGetTransactionQuery,
  useDeleteTransactionMutation,
  useGetTransactionsQuery,
} from '../../app/store/api/transactionApi'
import { Modal } from '../../shared/components/Modal'
import { pageLayout } from '../../shared/styles/layout'
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
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <h2 className="text-xl font-semibold text-foreground uppercase tracking-wide">
          Transaction not found
        </h2>
        <button
          onClick={() => navigate('/transactions')}
          className="px-6 py-2.5 bg-ui-surface border border-ui-border rounded-xl text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-primary hover:border-primary/30 transition-all shadow-sm"
        >
          Back to Transactions
        </button>
      </div>
    )
  }

  // Undo infrastructure exists for transactions but is not yet wired here — see UNDO_POLICY.md.
  const handleDelete = async () => {
    try {
      await deleteTransaction(transaction.id).unwrap()
      navigate('/transactions', { replace: true })
    } catch (err) {
      console.error('Failed to delete transaction:', err)
    }
  }

  return (
    <div className={pageLayout.sectionGap}>
      <header className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-16">
        <div className="space-y-4">
          <TransactionDetailHeader
            amount={transaction.amount}
            type={transaction.type}
            date={transaction.transactionDate}
          />
        </div>
        <div className="flex flex-col gap-4 w-full md:w-auto">
          <TransactionActionGroup
            onEdit={() => navigate(`/transactions/edit/${transaction.id}`)}
            onDelete={() => setIsDeleteModalOpen(true)}
            isProcessing={isDeleting}
          />
        </div>
      </header>

      <div className="space-y-16">
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

        <section className="pt-12 border-t border-ui-border-subtle animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between mb-8 px-1">
            <div className="flex items-center gap-2">
              <div className="h-4 w-1 bg-primary rounded-full" />
              <h2 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                History & Related
              </h2>
            </div>
            <div className="text-xs font-semibold uppercase tracking-wide text-primary bg-primary/5 px-3 py-1 rounded-full">
              Same Category
            </div>
          </div>
          <RelatedTransactionsList transactions={relatedTransactions} isLoading={isLoadingAll} />
        </section>
      </div>

      <Modal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Transaction"
        footer={
          <div className="flex gap-3 mt-6">
            <button
              className="flex-1 px-4 py-2.5 bg-ui-surface border border-ui-border rounded-xl text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:bg-ui-surface-muted transition-all shadow-sm"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="flex-1 px-4 py-2.5 bg-ui-danger border border-ui-danger/30 rounded-xl text-xs font-semibold uppercase tracking-wide text-white hover:bg-ui-danger/90 transition-all shadow-sm disabled:opacity-50"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Confirm Delete'}
            </button>
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
