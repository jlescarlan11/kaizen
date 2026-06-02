import { useState, useMemo, type ReactElement } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useGetTransactionQuery,
  useDeleteTransactionMutation,
  useGetTransactionsQuery,
} from '../../app/store/api/transactionApi'
import { Modal } from '../../shared/components/Modal'
import { Button } from '../../shared/components/Button'
import { useAppDispatch } from '../../app/store/hooks'
import { showAlert } from '../../app/store/notificationSlice'
import { pageLayout } from '../../shared/styles/layout'
import { TransactionDetailHeader } from './components/TransactionDetailHeader'
import { TransactionDetailInfo } from './components/TransactionDetailInfo'
import { TransactionActionGroup } from './components/TransactionActionGroup'
import { TransactionNoteSection } from './components/TransactionNoteSection'
import { AttachmentViewer } from './components/AttachmentViewer'
import { RelatedTransactionsList } from './components/RelatedTransactionsList'
import { useSetBreadcrumbLabel } from '../../shared/components/BreadcrumbLabelContext'

export function TransactionDetailPage(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const transactionId = Number(id)

  const { data: transaction, isLoading, error } = useGetTransactionQuery(transactionId)
  const { data: allTransactionsData, isLoading: isLoadingAll } = useGetTransactionsQuery({
    pageSize: 50,
  })

  const [deleteTransaction, { isLoading: isDeleting }] = useDeleteTransactionMutation()

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  useSetBreadcrumbLabel(transaction?.description ?? transaction?.category?.name)

  // Filter related transactions (same category, excluding current one)
  const relatedTransactions = useMemo(() => {
    const items = allTransactionsData?.items ?? []
    if (!transaction || items.length === 0) return []
    return items
      .filter((t) => t.id !== transaction.id && t.category?.id === transaction.category?.id)
      .slice(0, 3) // Only show top 3
  }, [transaction, allTransactionsData])

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
        <h2 className="text-xl font-semibold text-text-primary uppercase tracking-wide">
          Transaction not found
        </h2>
        <Button variant="secondaryLg" onClick={() => navigate('/transactions')}>
          Back to Transactions
        </Button>
      </div>
    )
  }

  // Undo infrastructure exists for transactions but is not yet wired here — see UNDO_POLICY.md.
  const handleDelete = async () => {
    try {
      await deleteTransaction(transaction.id).unwrap()
      dispatch(
        showAlert({
          type: 'success',
          title: 'Transaction Deleted',
          message: 'The transaction has been removed.',
        }),
      )
      navigate('/transactions', { replace: true })
    } catch (err) {
      console.error('Failed to delete transaction:', err)
      dispatch(
        showAlert({
          type: 'error',
          title: 'Deletion Failed',
          message: 'Could not delete the transaction. Please try again.',
        }),
      )
    }
  }

  return (
    <div className={pageLayout.sectionGap}>
      <div className="w-full">
        <div className="flex justify-end mb-6">
          <TransactionActionGroup
            onEdit={() => navigate(`/transactions/edit/${transaction.id}`)}
            onDelete={() => setIsDeleteModalOpen(true)}
            isProcessing={isDeleting}
          />
        </div>
        {/* Receipt card */}
        <div className="mb-8 overflow-hidden rounded-xl border border-border-subtle bg-surface">
          <TransactionDetailHeader
            amount={transaction.amount}
            type={transaction.type}
            date={transaction.transactionDate}
          />
          <div className="border-t border-dashed border-border" />
          <TransactionDetailInfo
            category={transaction.category}
            paymentMethod={transaction.paymentMethod}
            description={transaction.description}
          />
        </div>

        <div className="space-y-16">
          {transaction.notes && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <TransactionNoteSection description={null} notes={transaction.notes} />
            </section>
          )}

          {transaction.attachments && transaction.attachments.length > 0 && (
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-600">
              <AttachmentViewer attachments={transaction.attachments} />
            </section>
          )}

          <section className="pt-12 border-t border-border-subtle animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-8 px-1">
              <div className="flex items-center gap-2">
                <div className="h-4 w-1 bg-primary rounded-full" />
                <h2 className="text-xs font-semibold uppercase tracking-wide text-text-secondary">
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
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={isDeleting}
                isLoading={isDeleting}
                onClick={handleDelete}
              >
                Confirm Delete
              </Button>
            </div>
          }
        >
          <p className="text-text-secondary">Are you sure you want to delete this transaction?</p>
        </Modal>
      </div>
    </div>
  )
}
