import { useState, useCallback, useMemo, useEffect } from 'react'
import {
  useGetTransactionsQuery,
  useLazyGetTransactionsQuery,
} from '../../../app/store/api/transactionApi'
import type { TransactionResponse, TransactionFilters } from '../../../app/store/api/transactionApi'
import { TRANSACTION_PAGE_SIZE } from '../constants'
import { db, SyncStatus } from '../lib/localStore'
import { useLiveQuery } from 'dexie-react-hooks'

export function useTransactionPagination(filters: TransactionFilters = {}) {
  const [transactions, setTransactions] = useState<TransactionResponse[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [isFetchingMore, setIsFetchingMore] = useState(false)

  // Fetch local pending transactions
  const pendingTransactions = useLiveQuery(
    () => db.transactions.where('syncStatus').equals(SyncStatus.PENDING).toArray(),
    [],
  )

  // Initial fetch
  const {
    data: initialData,
    isLoading,
    isError,
    isFetching,
  } = useGetTransactionsQuery({
    ...filters,
    pageSize: TRANSACTION_PAGE_SIZE,
  })

  const [trigger] = useLazyGetTransactionsQuery()

  // Reset and set initial data when filters or initialData change
  useEffect(() => {
    if (initialData) {
      setTransactions(initialData.items)
      setHasMore(initialData.items.length === TRANSACTION_PAGE_SIZE)
    } else if (!isFetching) {
      // If we are not fetching and have no data (e.g. filters changed but query not started)
      // we don't necessarily want to clear, but the query will auto-trigger on filter change.
    }
  }, [initialData, isFetching])

  // Reset transactions immediately when filters change to avoid showing stale data
  const filterKey = JSON.stringify(filters)
  useEffect(() => {
    setTransactions([])
    setHasMore(true)
  }, [filterKey])

  const loadMore = useCallback(async () => {
    if (isFetchingMore || !hasMore || transactions.length === 0) return

    setIsFetchingMore(true)
    const lastTx = transactions[transactions.length - 1]

    try {
      const result = await trigger({
        ...filters,
        pageSize: TRANSACTION_PAGE_SIZE,
        lastDate: lastTx.transactionDate,
        lastId: lastTx.id,
      }).unwrap()

      setTransactions((prev) => [...prev, ...result.items])
      setHasMore(result.items.length === TRANSACTION_PAGE_SIZE)
    } catch (error) {
      console.error('Failed to fetch more transactions', error)
    } finally {
      setIsFetchingMore(false)
    }
  }, [isFetchingMore, hasMore, transactions, trigger, filters])

  // Map local pending transactions to TransactionResponse format for merging
  const mappedPending = useMemo(() => {
    if (!pendingTransactions) return []
    return pendingTransactions.map(
      (pt) =>
        ({
          id: -1, // Use a dummy ID for pending
          amount: pt.amount,
          type: pt.type,
          transactionDate: pt.transactionDate || pt.createdAt,
          description: pt.description || '',
          notes: pt.notes,
          isRecurring: pt.isRecurring,
          frequencyUnit: pt.frequencyUnit,
          frequencyMultiplier: pt.frequencyMultiplier,
          clientGeneratedId: pt.clientGeneratedId,
          // Missing category and payment method details from local store
          // (Instruction 6 says sync status flag not exposed, just merge them)
        }) as TransactionResponse,
    )
  }, [pendingTransactions])

  const allTransactions = useMemo(() => {
    // Prevent flickering: If the current state is empty (e.g., during a filter reset)
    // but the backend query already has data (e.g., from cache), use the backend data immediately.
    const baseTransactions =
      transactions.length === 0 && initialData ? initialData.items : transactions

    const combined = [...mappedPending, ...baseTransactions]
    // Sort by date descending
    return combined.sort(
      (a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime(),
    )
  }, [mappedPending, transactions, initialData])

  return {
    transactions: allTransactions,
    isLoading,
    isError,
    isFetching,
    hasMore,
    loadMore,
    isFetchingMore,
  }
}
