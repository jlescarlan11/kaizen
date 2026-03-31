import { useState, type ReactElement } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useGetTransactionQuery,
  useDeleteTransactionMutation,
  useCreateTransactionMutation,
  type TransactionRequest,
} from '../../app/store/api/transactionApi'
import { Button } from '../../shared/components/Button'
import { Modal } from '../../shared/components/Modal'
import { pageLayout } from '../../shared/styles/layout'
import { cn } from '../../shared/lib/cn'
import { TransactionDetailHeader } from './components/TransactionDetailHeader'
import { TransactionDetailInfo } from './components/TransactionDetailInfo'
import { TransactionActionGroup } from './components/TransactionActionGroup'

export function TransactionDetailPage(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: transaction, isLoading, error } = useGetTransactionQuery(Number(id))
  const [deleteTransaction, { isLoading: isDeleting }] = useDeleteTransactionMutation()
  const [createTransaction, { isLoading: isDuplicating }] = useCreateTransactionMutation()

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

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

  const handleDuplicate = async () => {
    try {
      const {
        category,
        paymentMethod,
        amount,
        type,
        description,
        notes,
        isRecurring,
        frequencyUnit,
        frequencyMultiplier,
        remindersEnabled,
      } = transaction

      const payload: TransactionRequest = {
        amount,
        type,
        description,
        notes,
        isRecurring,
        frequencyUnit,
        frequencyMultiplier,
        remindersEnabled,
        categoryId: category?.id,
        paymentMethodId: paymentMethod?.id,
        transactionDate: new Date().toISOString(),
      }

      await createTransaction(payload).unwrap()
      navigate('/transactions')
    } catch (err) {
      console.error('Failed to duplicate transaction:', err)
    }
  }

  return (
    <div className={cn(pageLayout.sectionGap, 'pt-4 md:pt-8')}>
      <div className="mx-auto max-w-3xl w-full space-y-12 pb-20">
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
          onDelete={() => setIsDeleteModalOpen(true)}
          onDuplicate={handleDuplicate}
          isProcessing={isDeleting || isDuplicating}
        />

        <TransactionDetailInfo
          category={transaction.category}
          paymentMethod={transaction.paymentMethod}
          description={transaction.description}
          notes={transaction.notes}
          type={transaction.type}
        />
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
