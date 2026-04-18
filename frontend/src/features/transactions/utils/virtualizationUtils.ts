import type { TransactionResponse } from '../../../app/store/api/transactionApi'

export type FlattenedTransactionItem =
  | { type: 'header'; date: string }
  | { type: 'transaction'; transaction: TransactionResponse }

/**
 * Flattens grouped transactions into a single list of items for virtualization.
 */
export function flattenTransactions(
  transactions: TransactionResponse[],
  groupFn: (
    txs: TransactionResponse[],
  ) => Array<{ date: string; transactions: TransactionResponse[] }>,
): FlattenedTransactionItem[] {
  const groups = groupFn(transactions)
  const flattened: FlattenedTransactionItem[] = []

  for (const group of groups) {
    flattened.push({ type: 'header', date: group.date })
    for (const tx of group.transactions) {
      flattened.push({ type: 'transaction', transaction: tx })
    }
  }

  return flattened
}
