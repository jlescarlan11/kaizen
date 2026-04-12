import { useEffect, type ReactElement } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useGetTransactionQuery } from '../../../app/store/api/transactionApi'
import { Card } from '../../../shared/components'

export function ReminderRedirectHandler(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    data: transaction,
    error,
    isLoading,
  } = useGetTransactionQuery(parseInt(id!), {
    skip: !id,
  })

  useEffect(() => {
    if (transaction) {
      navigate('/transactions/add', {
        state: {
          prefill: {
            amount: transaction.amount,
            type: transaction.type,
            description: transaction.description,
            categoryId: transaction.category?.id,
            paymentMethodId: transaction.paymentMethod?.id,
            parentRecurringTransactionId: transaction.id, // Mark this as the parent
          },
        },
        replace: true,
      })
    } else if (error) {
      console.error('Failed to fetch recurring transaction:', error)
      navigate('/', { replace: true })
    }
  }, [transaction, error, navigate])

  if (isLoading) {
    return (
      <Card className="p-12 flex justify-center border border-ui-border-subtle shadow-sm">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </Card>
    )
  }

  return <></>
}
